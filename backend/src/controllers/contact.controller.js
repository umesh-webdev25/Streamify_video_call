import * as contactService from "../services/contact.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/apiResponse.js";
import AppError from "../utils/AppError.js";

/**
 * CREATE CONTACT
 */
export const createContact = asyncHandler(async (req, res) => {
  const {
    groupId,
    name,
    email,
    mobileNumber,
    designation,
    contactImage,
  } = req.body;

  console.log("CreateContact - req.body:", req.body);
  console.log("CreateContact - req.file:", req.file);

  if (!groupId) {
    throw new AppError("Group ID is required to create a contact", 400);
  }

  const contact = await contactService.createContact(
    {
      groupId,
      name,
      email,
      mobileNumber,
      designation,
      contactImage,
    },
    req.user._id,
    req.file,
  );

  return ApiResponse.success(res, contact, "Contact created successfully", 201);
});

/**
 * GET ALL CONTACTS
 */
export const getAllContacts = asyncHandler(async (req, res) => {
  const includeDeleted = req.query.includeDeleted === "true";
  const contacts = await contactService.getAllContacts(req.user._id, includeDeleted);
  return ApiResponse.success(res, contacts);
});

/**
 * GET CONTACT BY ID
 */
export const getContactById = asyncHandler(async (req, res) => {
  const contact = await contactService.getContactById(
    req.params.id,
    req.user._id,
  );
  if (!contact) {
    throw new AppError("Contact not found", 404);
  }
  return ApiResponse.success(res, contact);
});

/**
 * UPDATE CONTACT
 */
export const updateContact = asyncHandler(async (req, res) => {
  console.log("UpdateContact - req.body:", req.body);
  console.log("UpdateContact - req.file:", req.file);
  const {
    name,
    email,
    mobileNumber,
    designation,
    contactImage: contactImageBody,
  } = req.body;

  const updateData = {
    name,
    email,
    mobileNumber,
    designation,
  };

  if (contactImageBody) {
    updateData.contactImage = contactImageBody;
  }

  if (req.file) {
    updateData.contactImage = req.file.path || req.file.secure_url || "";
  }

  const contact = await contactService.updateContact(
    req.params.id,
    req.user._id,
    updateData,
    req.file,
  );
  if (!contact) {
    throw new AppError("Contact not found", 404);
  }

  return ApiResponse.success(res, contact, "Contact updated successfully");
});

/**
 * DELETE CONTACT
 */
export const deleteContact = asyncHandler(async (req, res) => {
  const contact = await contactService.deleteContact(
    req.params.id,
    req.user._id,
  );
  if (!contact) {
    throw new AppError("Contact not found", 404);
  }
  return ApiResponse.success(res, null, "Contact deleted successfully");
});

/**
 * INVITE CONTACT / AUTOMATIC GROUP ACCESS
 */
export const inviteContact = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    mobileNumber,
    designation,
    groupId,
    contactImage,
  } = req.body;
  const io = req.app.get("io");

  console.log("InviteContact - req.body:", req.body);
  console.log("InviteContact - req.file:", req.file);

  const result = await contactService.inviteExistingUserToContact(
    req.user._id,
    { name, email, mobileNumber, designation, groupId, contactImage },
    io,
    req.file,
  );

  return ApiResponse.success(res, result, "Invitation processed successfully");
});
