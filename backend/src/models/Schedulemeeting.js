import mongoose from "mongoose";

const scheduleMeetingSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ""
    },
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group",
        required: true
    },
    date: {
        type: String, // Keeping date and time for backward compatibility
    },
    time: {
        type: String,
    },
    scheduledAt: {
        type: Date,
        required: true
    },
    meetingCode: {
        type: String,
        default: null
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    invitees: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    status: {
        type: String,
        enum: ["pending", "active", "completed", "cancelled", "upcoming", "expired"],
        default: "upcoming"
    }
}, { timestamps: true })

const ScheduleMeeting = mongoose.models.ScheduleMeeting || mongoose.model("ScheduleMeeting", scheduleMeetingSchema)

export default ScheduleMeeting