import mongoose from "mongoose";

const groupSchema = new mongoose.Schema(
  {
    // Group Details
    groupName: {
      type: String,
      required: true,
      trim: true,
    },

    groupBio: {
      type: String,
      default: "",
      trim: true,
    },

    groupImage: {
      type: String,
      default: "",
    },

    // Group Status
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    // Admin Only Messaging Mode
    adminOnlyMessaging: {
      type: Boolean,
      default: false,
    },

    // Members
    members: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        role: {
          type: String,
          enum: ["admin", "member"],
          default: "member",
        },
      },
    ],

    // Separate Admins Array
    admins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // Soft Delete
    isDeleted: {
      type: Boolean,
      default: false,
    },

    deletedAt: {
      type: Date,
      default: null,
    },

    // Cached contact count for the group
    contactCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Prevent duplicate model overwrite
 */
const Group =
  mongoose.models.Group ||
  mongoose.model("Group", groupSchema);

export default Group;