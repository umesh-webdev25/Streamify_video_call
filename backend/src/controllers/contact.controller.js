import * as contactService from "../services/contact.service.js";

/**
 * CREATE CONTACT
 */
export const createContact = async (req, res) => {
  try {
    const { groupId, name, email, mobileNumber, designation, contactImage: contactImageBody } = req.body;
    
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
    });

    return res.status(201).json({
      success: true,
      data: contact,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * GET ALL CONTACTS
 */
export const getAllContacts = async (req, res) => {
  try {
    const contacts = await contactService.getAllContacts();

    return res.status(200).json({
      success: true,
      data: contacts,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * GET CONTACT BY ID
 */
export const getContactById = async (req, res) => {
  try {
    const contact = await contactService.getContactById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: contact,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * UPDATE CONTACT
 */
export const updateContact = async (req, res) => {
  try {
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

    const contact = await contactService.updateContact(req.params.id, updateData);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: contact,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * DELETE CONTACT
 */
export const deleteContact = async (req, res) => {
  try {
    const contact = await contactService.deleteContact(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Contact deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
