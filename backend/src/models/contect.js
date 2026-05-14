import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
  {
    // Group Reference
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },

    // Contact Details
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    mobileNumber: {
      type: String,
      required: true,
      trim: true,
    },

    // Soft Delete
    isDeleted: {
      type: Boolean,
      default: false,
    },

    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Prevent model overwrite
 */
const Contact =
  mongoose.models.Contact ||
  mongoose.model(
    "Contact",
    contactSchema
  );

export default Contact;