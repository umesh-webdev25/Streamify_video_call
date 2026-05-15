// services/contact.service.js

import Contact from "../models/contect.js";

/**
 * CREATE CONTACT
 */
export const createContact = async (
  data
) => {
  return await Contact.create(data);
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