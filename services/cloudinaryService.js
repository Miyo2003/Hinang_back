// services/cloudinaryService.js
const cloudinary = require('cloudinary').v2;
const cloudConfig = require('../config/cloud');

// Configure Cloudinary
cloudinary.config({
  cloud_name: cloudConfig.cloudinary.cloudName,
  api_key: cloudConfig.cloudinary.apiKey,
  api_secret: cloudConfig.cloudinary.apiSecret,
});

const uploadToCloudinary = async (fileBuffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder || 'attachments',
        resource_type: 'auto',
        ...options,
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
    uploadStream.end(fileBuffer);
  });
};

const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, { resource_type: resourceType }, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};

module.exports = {
  uploadToCloudinary,
  deleteFromCloudinary,
};
