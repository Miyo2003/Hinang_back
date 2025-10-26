const parseCloudinaryUrl = (url) => {
  if (!url) return {};
  const match = url.match(/cloudinary:\/\/(\w+):([^@]+)@(.+)/);
  if (match) {
    return {
      apiKey: match[1],
      apiSecret: match[2],
      cloudName: match[3]
    };
  }
  return {};
};

const cloudinaryConfig = parseCloudinaryUrl(process.env.CLOUDINARY_URL) || {
  apiKey: process.env.CLOUDINARY_API_KEY,
  apiSecret: process.env.CLOUDINARY_API_SECRET,
  cloudName: process.env.CLOUDINARY_CLOUD_NAME
};

module.exports = {
  cloudinary: {
    ...cloudinaryConfig,
    unsignedPreset: process.env.CLOUDINARY_UNSIGNED_PRESET || 'hinang_unsigned_uploads'
  }
};
