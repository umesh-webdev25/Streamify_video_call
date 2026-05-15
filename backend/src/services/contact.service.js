// services/contact.service.js

import Contact from "../models/contect.js";
import Group from "../models/group.js";

/**
 * CREATE CONTACT
 */
export const createContact = async (
  data
) => {
  const contact = await Contact.create(data);

  // Increment group's contactCount
  try {
    if (contact.groupId) {
      await Group.findByIdAndUpdate(contact.groupId, { $inc: { contactCount: 1 } });
    }
  } catch (err) {
    // Log but don't fail the contact creation
    console.error("Failed to increment group contactCount:", err);
  }

  return contact;
};

/**
 * GET ALL CONTACTS
 */
export const getAllContacts = async () => {
  return await Contact.find({
    isDeleted: false,
  })
    .populate("groupId", "groupName")
    .sort({ createdAt: -1 });
};

/**
 * GET CONTACT BY ID
 */
export const getContactById = async (
  id
) => {
  return await Contact.findOne({
    _id: id,
    isDeleted: false,
  }).populate("groupId", "groupName");
};

/**
 * UPDATE CONTACT
 */
export const updateContact = async (
  id,
  data
) => {
  return await Contact.findByIdAndUpdate(
    id,
    data,
    {
      new: true,
      runValidators: true,
    }
  );
};

/**
 * DELETE CONTACT
 */
export const deleteContact = async (
  id
) => {
  // Find the contact first to get its groupId
  const contact = await Contact.findById(id);
  if (!contact) return null;

  // Decrement group's contactCount
  try {
    if (contact.groupId) {
      await Group.findByIdAndUpdate(contact.groupId, { $inc: { contactCount: -1 } });
    }
  } catch (err) {
    console.error("Failed to decrement group contactCount:", err);
  }

  // Soft-delete the contact
  return await Contact.findByIdAndUpdate(
    id,
    {
      isDeleted: true,
      deletedAt: new Date(),
    },
    {
      new: true,
    }
  );
};