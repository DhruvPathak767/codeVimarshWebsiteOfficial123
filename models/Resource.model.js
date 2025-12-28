
import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  link: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  cloudinaryPublicId: {
    type: String
  },
  category: {
    type: String,
    required: true,
    enum: ['dsa', 'playlist', 'other'], // basic categories, can be expanded
    default: 'other'
  }
}, { timestamps: true });

export default mongoose.model('Resource', resourceSchema);
