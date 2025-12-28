import mongoose from "mongoose";
const TeamSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    position: {
        type: String,
        enum: ['initiators', 'members'],
        required: true
    },
    image: {
        type: String,
        required: true
    },
    cloudinaryPublicId: {
        type: String
    },
    linkedin: {
        type: String,
        required: true
    },
    role: {
        type: String,

        required: true
    }
})
export default mongoose.model("Team", TeamSchema)