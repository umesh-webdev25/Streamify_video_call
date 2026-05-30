import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    meetingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Meeting",
      required: true,
    },
    refreshToken: {
      type: String,
      required: true,
    },
    ipAddress: {
      type: String,
      default: "unknown",
    },
    userAgent: {
      type: String,
      default: "unknown",
    },
    deviceInfo: {
      type: String,
      default: "unknown",
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    revoked: {
      type: Boolean,
      default: false,
    },
    lastActivity: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Auto delete expired sessions
sessionSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

const Session =
  mongoose.models.Session ||
  mongoose.model(
    "Session",
    sessionSchema
  );

export default Session;