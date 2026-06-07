import Contact from "../models/contect.js";
import cloudinary from "../lib/cloudinary.js";
import User from "../models/User.js";
import Group from "../models/group.js";
import AppError from "../utils/AppError.js";
import { verifyGroupMembership, verifyGroupAdmin } from "./group.service.js";
import Notification from "../models/Notification.js";
import notificationService from "./notification.service.js";
import { sendAddedToGroupEmail } from "./email.service.js";

const buildContactPayload = (contactData = {}) => ({
  groupId: contactData.groupId,
  name: contactData.name?.trim(),
  email: contactData.email?.trim().toLowerCase(),
  mobileNumber: contactData.mobileNumber?.trim(),
  designation: contactData.designation?.trim() || "",
});

const resolveUploadedFileUrl = async (file, folder = "contacts") => {
  if (!file) {
    console.log("Contact image upload skipped: req.file is undefined");
    return "";
  }

  console.log("Contact image file received", {
    fieldName: file.fieldname,
    originalName: file.originalname,
    mimeType: file.mimetype,
    path: file.path,
    secureUrl: file.secure_url,
    filename: file.filename,
    size: file.size,
    hasBuffer: Boolean(file.buffer),
  });

  if (typeof file.path === "string" && file.path.startsWith("http")) {
    return file.path;
  }

  if (typeof file.secure_url === "string" && file.secure_url.startsWith("http")) {
    return file.secure_url;
  }

  if (file.buffer) {
    const fileBase64 = file.buffer.toString("base64");
    const dataUri = `data:${file.mimetype};base64,${fileBase64}`;
    const uploadResponse = await cloudinary.uploader.upload(dataUri, { folder });

    console.log("Contact image uploaded to Cloudinary from buffer", {
      publicId: uploadResponse.public_id,
      secureUrl: uploadResponse.secure_url,
    });

    return uploadResponse.secure_url;
  }

  throw new AppError(
    "Image upload failed: Cloudinary did not return a URL for the uploaded file",
    500,
  );
};

/**
 * VERIFY CONTACT CONNECTION HELPER
 */
export const verifyContactConnection = async (requestingUserId, targetUserId) => {
  if (requestingUserId.toString() === targetUserId.toString()) {
    return true;
  }
  const user = await User.findOne({
    _id: requestingUserId,
    friends: targetUserId,
  });
  if (!user) {
    throw new AppError("You are not connected to this user", 403);
  }
  return true;
};

/**
 * CREATE CONTACT
 */
export const createContact = async (contactData, userId, file) => {
  try {
    const normalizedContactData = buildContactPayload(contactData);

    if (!normalizedContactData.groupId) {
      throw new AppError("Group ID is required to create a contact", 400);
    }

    await verifyGroupAdmin(normalizedContactData.groupId, userId);

    const imageUrl =
      (await resolveUploadedFileUrl(file)) ||
      contactData.contactImage?.trim() ||
      "";

    console.log("Creating contact with payload", {
      ...normalizedContactData,
      userId: userId?.toString(),
      contactImage: imageUrl,
    });

    const contact = new Contact({
      ...normalizedContactData,
      contactImage: imageUrl,
    });

    await contact.save();

    console.log("Contact created successfully", {
      contactId: contact._id.toString(),
      contactImage: contact.contactImage,
    });

    return contact;
  } catch (error) {
    console.error("Error creating contact:", error);
    if (error instanceof AppError) throw error;
    throw new AppError("Failed to create contact", 500);
  }
};

/**
 * GET ALL CONTACTS (scoped to user's group memberships)
 */
export const getAllContacts = async (userId) => {
  try {
    const myGroups = await Group.find({
      "members.userId": userId,
      isDeleted: { $ne: true }
    }).select("_id");
    const myGroupIds = myGroups.map((g) => g._id);

    const contacts = await Contact.find({
      groupId: { $in: myGroupIds },
      isDeleted: { $ne: true }
    }).sort({ createdAt: -1 });

    return contacts;
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 * GET CONTACT BY ID
 */
export const getContactById = async (id, userId) => {
  try {
    const contact = await Contact.findById(id);
    if (!contact || contact.isDeleted) {
      throw new AppError("Contact not found", 404);
    }
    // Verify membership of contact's group
    await verifyGroupMembership(contact.groupId, userId);
    return contact;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new Error(error.message);
  }
};

/**
 * UPDATE CONTACT
 */
export const updateContact = async (id, userId, updateData, file) => {
  try {
    const contact = await Contact.findById(id);
    if (!contact || contact.isDeleted) {
      throw new AppError("Contact not found", 404);
    }

    // Verify membership of contact's group
    await verifyGroupAdmin(contact.groupId, userId);

    let contactImage = contact.contactImage;
    if (file) {
      contactImage = await resolveUploadedFileUrl(file);
    } else if (updateData.contactImage) {
      contactImage = updateData.contactImage;
    }

    console.log("Updating contact", {
      contactId: id,
      userId: userId?.toString(),
      contactImage,
    });

    const updatedContact = await Contact.findByIdAndUpdate(
      id,
      { ...updateData, contactImage },
      { new: true }
    );
    return updatedContact;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new Error(error.message);
  }
};

/**
 * DELETE CONTACT
 */
export const deleteContact = async (id, userId) => {
  try {
    const contact = await Contact.findById(id);
    if (!contact || contact.isDeleted) {
      throw new AppError("Contact not found", 404);
    }

    // Verify membership of contact's group
    await verifyGroupAdmin(contact.groupId, userId);

    const deletedContact = await Contact.findByIdAndUpdate(
      id,
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );
    return deletedContact;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new Error(error.message);
  }
};

/**
 * INVITE EXISTING USER TO CONTACT / AUTOMATIC GROUP ACCESS
 */
export const inviteExistingUserToContact = async (
  ownerId,
  contactData,
  io,
  file,
) => {
  const normalizedContactData = buildContactPayload(contactData);
  const { name, email, designation, groupId, mobileNumber } = normalizedContactData;

  if (!groupId) {
    throw new AppError("Group ID is required", 400);
  }

  // STEP 1: Verify inviter belongs to group
  await verifyGroupAdmin(groupId, ownerId);

  // Normalize email
  const normalizedEmail = email;
  const contactImage =
    (await resolveUploadedFileUrl(file)) ||
    contactData.contactImage?.trim() ||
    "";

  console.log("Processing contact invitation", {
    ownerId: ownerId?.toString(),
    groupId,
    email: normalizedEmail,
    mobileNumber,
    designation,
    contactImage,
  });

  // STEP 2: Find existing platform user by email
  const existingUser = await User.findOne({ email: normalizedEmail });

  // Fetch group to get groupName and check membership
  const group = await Group.findById(groupId);
  if (!group || group.isDeleted) {
    throw new AppError("Group not found or has been deleted", 404);
  }

  // Fetch inviter info
  const inviterUser = await User.findById(ownerId);
  if (!inviterUser) {
    throw new AppError("Inviter not found", 404);
  }

  // STEP 3: Prevent duplicate contact relationship check
  const existingContact = await Contact.findOne({
    email: normalizedEmail,
    groupId,
    isDeleted: { $ne: true }
  });

  if (existingUser) {
    // Prevent duplicate group membership check
    const isAlreadyMember = group.members.some(
      (m) => m.userId.toString() === existingUser._id.toString()
    );

    if (existingContact && isAlreadyMember) {
      // Return success early (account enumeration safety)
      return { success: true, message: "Invitation processed successfully" };
    }

    // STEP 4: Create contact relationship (only if contact doesn't exist)
    if (!existingContact) {
      const contact = new Contact({
        groupId,
        name,
        email: normalizedEmail,
        designation,
        mobileNumber: mobileNumber || "N/A",
        contactImage,
      });
      await contact.save();
    }

    // STEP 5: Add invited user to group members array
    if (!isAlreadyMember) {
      group.members.push({ userId: existingUser._id, role: "member" });
      await group.save();
    }

    // STEP 6: Create notification
    const existingNotification = await Notification.findOne({
      recipient: existingUser._id,
      sender: ownerId,
      type: "group_added",
      "data.groupId": groupId,
    });

    if (!existingNotification) {
      await notificationService.send({
        recipientId: existingUser._id,
        senderId: ownerId,
        type: "group_added",
        title: "Added to Group",
        content: `${inviterUser.fullName} added you to ${group.groupName} Group as ${designation}`,
        metaData: {
          designation,
          groupId,
          groupName: group.groupName,
        },
      });
    }

    // STEP 7: Send email
    await sendAddedToGroupEmail({
      to: existingUser.email,
      inviterName: inviterUser.fullName,
      groupName: group.groupName,
      designation,
    });

    // STEP 8: Emit realtime socket event
    if (io) {
      io.emit("group_invitation_received", {
        groupId,
        groupName: group.groupName,
        invitedUserId: existingUser._id,
      });
      io.emit("group_member_added", {
        groupId,
        groupName: group.groupName,
        invitedUserId: existingUser._id,
      });
      io.to(`group:${groupId}`).emit("group_member_added", {
        groupId,
        groupName: group.groupName,
        invitedUserId: existingUser._id,
      });
    }
  } else {
    // Non-existing user flow: just create standard contact
    if (!existingContact) {
      const contact = new Contact({
        groupId,
        name,
        email: normalizedEmail,
        designation,
        mobileNumber: mobileNumber || "N/A",
        contactImage,
      });
      await contact.save();
    }
  }

  return { success: true, message: "Invitation processed successfully" };
};
