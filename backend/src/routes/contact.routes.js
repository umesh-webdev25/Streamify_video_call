// routes/contact.routes.js

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

// multer upload middleware
import upload from "../middleware/upload.middleware.js";
import validate from "../middleware/validate.middleware.js";
import { inviteContactSchema } from "../validators/contact.validator.js";

const router = express.Router();

router.use(protectRoute);

/**
 * INVITE CONTACT / AUTOMATIC GROUP ACCESS
 */
router.post(
  "/invite",
  validate(inviteContactSchema),
  inviteContact
);

/**
 * CREATE CONTACT
 */
router.post(
  "/",
  upload.single("contactImage"),
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
  upload.single("contactImage"),
  updateContact
);

/**
 * DELETE CONTACT
 */
router.delete("/:id", deleteContact);

export default router;