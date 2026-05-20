import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";

import {
  createContact,
  getAllContacts,
  getContactById,
  updateContact,
  deleteContact,
  inviteContact,
} from "../controllers/contact.controller.js";

import { uploadContact } from "../middleware/upload.middleware.js";

import validate from "../middleware/validate.middleware.js";

import { inviteContactSchema } from "../validators/contact.validator.js";

const router = express.Router();

router.use(protectRoute);

/**
 * INVITE CONTACT / AUTOMATIC GROUP ACCESS
 */
router.post(
  "/invite",
  uploadContact.single("contactImage"),
  validate(inviteContactSchema),
  inviteContact
);

/**
 * CREATE CONTACT
 */
router.post(
  "/",
  uploadContact.single("contactImage"),
  createContact
);

/**
 * GET ALL CONTACTS
 */
router.get("/", getAllContacts);

/**
 * GET CONTACT BY ID
 */
router.get("/:id", getContactById);

/**
 * UPDATE CONTACT
 */
router.put(
  "/:id",
  uploadContact.single("contactImage"),
  updateContact
);

/**
 * DELETE CONTACT
 */
router.delete("/:id", deleteContact);

export default router;