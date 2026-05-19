import Contact from "../models/contect.js";
import cloudinary from "../lib/cloudinary.js";
import fs from "fs";
import User from "../models/User.js";
import Group from "../models/group.js";
import AppError from "../utils/AppError.js";
import { verifyGroupMembership } from "./group.service.js";
import Notification from "../models/Notification.js";
import notificationService from "./notification.service.js";
import { sendAddedToGroupEmail } from "./email.service.js";

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
export const createContact = async (contactData, userId) => {
  try {
    // Verify user is a member of the group where the contact is being added
    await verifyGroupMembership(contactData.groupId, userId);

    let { contactImage } = contactData;

    // If image is a local path or base64, upload to cloudinary
    if (contactImage && (contactImage.startsWith("/uploads") || contactImage.startsWith("data:image"))) {
      const uploadResponse = await cloudinary.uploader.upload(
        contactImage.startsWith("/") ? `.${contactImage}` : contactImage,
        { folder: "contacts" }
      );
      contactImage = uploadResponse.secure_url;

      // Clean up local file if it was a local path
      if (contactData.contactImage.startsWith("/uploads")) {
        try { fs.unlinkSync(`.${contactData.contactImage}`); } catch (e) {}
      }
    }

    const contact = new Contact({
      ...contactData,
      contactImage,
    });

    await contact.save();
    return contact;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new Error(error.message);
  }
};

/**
 * GET ALL CONTACTS (scoped to user's group memberships)
 */
export const getAllContacts = async (userId) => {
  try {
    const myGroups = await Group.find({
      "members.user": userId,
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
export const updateContact = async (id, userId, updateData) => {
  try {
    const contact = await Contact.findById(id);
    if (!contact || contact.isDeleted) {
      throw new AppError("Contact not found", 404);
    }

    // Verify membership of contact's group
    await verifyGroupMembership(contact.groupId, userId);

    let { contactImage } = updateData;

    if (contactImage && (contactImage.startsWith("/uploads") || contactImage.startsWith("data:image"))) {
      const uploadResponse = await cloudinary.uploader.upload(
        contactImage.startsWith("/") ? `.${contactImage}` : contactImage,
        { folder: "contacts" }
      );
      contactImage = uploadResponse.secure_url;

      if (updateData.contactImage.startsWith("/uploads")) {
        try { fs.unlinkSync(`.${updateData.contactImage}`); } catch (e) {}
      }
    }

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
    await verifyGroupMembership(contact.groupId, userId);

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
export const inviteExistingUserToContact = async (ownerId, contactData, io) => {
  const { name, email, designation, groupId } = contactData;

  if (!groupId) {
    throw new AppError("Group ID is required", 400);
  }

  // STEP 1: Verify inviter belongs to group
  await verifyGroupMembership(groupId, ownerId);

  // Normalize email
  const normalizedEmail = email.toLowerCase().trim();

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
      (m) => m.user.toString() === existingUser._id.toString()
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
        mobileNumber: contactData.mobileNumber || "N/A",
        contactImage: contactData.contactImage || "",
      });
      await contact.save();
    }

    // STEP 5: Add invited user to group members array
    if (!isAlreadyMember) {
      group.members.push({ user: existingUser._id, isAdmin: false });
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
        mobileNumber: contactData.mobileNumber || "N/A",
        contactImage: contactData.contactImage || "",
      });
      await contact.save();
    }
  }

  return { success: true, message: "Invitation processed successfully" };
};
