// routes/contact.routes.js

import express from "express";

import {
  createContact,
  getAllContacts,
  getContactById,
  updateContact,
  deleteContact,
} from "../controllers/contact.controller.js";

// multer upload middleware
import upload from "../middleware/upload.middleware.js";

const router = express.Router();

/**
 * CREATE CONTACT
 */
router.post(
  "/",
  upload.single("profileImage"),
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
  upload.single("profileImage"),
  updateContact
);

/**
 * DELETE CONTACT
 */
router.delete("/:id", deleteContact);

export default router;