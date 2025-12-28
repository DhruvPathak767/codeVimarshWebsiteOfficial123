import cloudinary from "../config/cloudinary.js";

export const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return;
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log(`Cloudinary Delete Result for ${publicId}:`, result);
    return result;
  } catch (error) {
    console.error(`Failed to delete image from Cloudinary (Public ID: ${publicId}):`, error);
    // We do not throw error here to ensure DB deletion can proceed
  }
};
