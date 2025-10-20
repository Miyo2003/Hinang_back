// config/cloud.js
module.exports = {
  cloudinary: {
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    unsignedPreset: process.env.CLOUDINARY_UNSIGNED_PRESET || 'hinang_unsigned_uploads'
  }
};