import mongoose from "mongoose";

const meetingSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      default: "",
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
    },
    meetingCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    maxParticipants: {
      type: Number,
      default: 50,
    },
    activeParticipants: {
      type: Number,
      default: 0,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    },
    hostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    participants: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
        leftAt: {
          type: Date,
        },
      },
    ],
    status: {
      type: String,
      enum: ["active", "ended", "scheduled"],
      default: "active",
    },
    waitingRoomEnabled: {
      type: Boolean,
      default: false,
    },
    pendingParticipants: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        requestedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    scheduledAt: {
      type: Date,
    },
    endedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

meetingSchema.index({ hostId: 1, status: 1 });
meetingSchema.index({ "participants.userId": 1 });
meetingSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Meeting = mongoose.model("Meeting", meetingSchema);

export default Meeting;
