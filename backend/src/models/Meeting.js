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

const Meeting = mongoose.model("Meeting", meetingSchema);

export default Meeting;
