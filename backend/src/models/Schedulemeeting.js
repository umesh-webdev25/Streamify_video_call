import mongoose from "mongoose";

const scheduleMeetingSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "completed", "cancelled", "upcoming", "expired"],
        default: "upcoming"
    }
})

const ScheduleMeeting = mongoose.models.ScheduleMeeting || mongoose.model("ScheduleMeeting", scheduleMeetingSchema)

export default ScheduleMeeting