import Contact from "../models/contect.js";
import cloudinary from "../lib/cloudinary.js";
import fs from "fs";

/**
 * CREATE CONTACT
 */
export const createContact = async (contactData) => {
  try {
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
    throw new Error(error.message);
  }
};

/**
 * GET ALL CONTACTS
 */
export const getAllContacts = async () => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    return contacts;
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 * GET CONTACT BY ID
 */
export const getContactById = async (id) => {
  try {
    const contact = await Contact.findById(id);
    return contact;
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 * UPDATE CONTACT
 */
export const updateContact = async (id, updateData) => {
  try {
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

    const contact = await Contact.findByIdAndUpdate(
      id,
      { ...updateData, contactImage },
      { new: true }
    );
    return contact;
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 * DELETE CONTACT
 */
export const deleteContact = async (id) => {
  try {
    const contact = await Contact.findByIdAndDelete(id);
    return contact;
  } catch (error) {
    throw new Error(error.message);
  }
};
