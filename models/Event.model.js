import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    cloudinaryPublicId: {
        type: String
    },
    eventDate: {
        type: Date,
        required: true
    },
    eventEndDate: {
        type: Date
    },
    registrationLink: {
        type: String,
        required: false
    }
});
export default mongoose.model("Event", eventSchema);