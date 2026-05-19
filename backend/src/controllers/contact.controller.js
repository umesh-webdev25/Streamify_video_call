import * as contactService from "../services/contact.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/apiResponse.js";
import AppError from "../utils/AppError.js";

/**
 * CREATE CONTACT
 */
export const createContact = asyncHandler(async (req, res) => {
  const { groupId, name, email, mobileNumber, designation, contactImage: contactImageBody } = req.body;

  if (!groupId) {
    throw new AppError("Group ID is required to create a contact", 400);
  }

  let contactImage = contactImageBody || "";
  if (req.file) {
    contactImage = `/uploads/${req.file.filename}`;
  }

  const contact = await contactService.createContact({
    groupId,
    name,
    email,
    mobileNumber,
    designation,
    contactImage,
  }, req.user._id);

  return ApiResponse.success(res, contact, "Contact created successfully", 201);
});

/**
 * GET ALL CONTACTS
 */
export const getAllContacts = asyncHandler(async (req, res) => {
  const contacts = await contactService.getAllContacts(req.user._id);
  return ApiResponse.success(res, contacts);
});

/**
 * GET CONTACT BY ID
 */
export const getContactById = asyncHandler(async (req, res) => {
  const contact = await contactService.getContactById(req.params.id, req.user._id);
  if (!contact) {
    throw new AppError("Contact not found", 404);
  }
  return ApiResponse.success(res, contact);
});

/**
 * UPDATE CONTACT
 */
export const updateContact = asyncHandler(async (req, res) => {
  const { name, email, mobileNumber, designation, contactImage: contactImageBody } = req.body;

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
    updateData.contactImage = `/uploads/${req.file.filename}`;
  }

  const contact = await contactService.updateContact(req.params.id, req.user._id, updateData);
  if (!contact) {
    throw new AppError("Contact not found", 404);
  }

  return ApiResponse.success(res, contact, "Contact updated successfully");
});

/**
 * DELETE CONTACT
 */
export const deleteContact = asyncHandler(async (req, res) => {
  const contact = await contactService.deleteContact(req.params.id, req.user._id);
  if (!contact) {
    throw new AppError("Contact not found", 404);
  }
  return ApiResponse.success(res, null, "Contact deleted successfully");
});

/**
 * INVITE CONTACT / AUTOMATIC GROUP ACCESS
 */
export const inviteContact = asyncHandler(async (req, res) => {
  const { name, email, designation, groupId } = req.body;
  const io = req.app.get("io");

  const result = await contactService.inviteExistingUserToContact(
    req.user._id,
    { name, email, designation, groupId },
    io
  );

  return ApiResponse.success(res, result, "Invitation processed successfully");
});
