// services/messageAttachmentService.js
const crypto = require('crypto');
const cloudConfig = require('../config/cloud');
const { assertFeatureEnabled } = require('../utils/featureToggle');

const SUPPORTED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'video/mp4',
  'video/quicktime',
  'audio/mpeg',
  'audio/wav',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

const generateCloudinarySignature = ({ timestamp, folder = 'messages' }) => {
  const { apiSecret, unsignedPreset } = cloudConfig.cloudinary;
  const paramsToSign = `folder=${folder}&timestamp=${timestamp}&upload_preset=${unsignedPreset}${apiSecret}`;
  const signature = crypto.createHash('sha1').update(paramsToSign).digest('hex');
  return { signature, timestamp };
};

const generateSignedUpload = async ({ fileType }) => {
  assertFeatureEnabled('richMessagingEnabled');

  if (!SUPPORTED_TYPES.includes(fileType)) {
    throw new Error(`Unsupported file type: ${fileType}`);
  }

  const timestamp = Math.round(Date.now() / 1000);
  const { signature } = generateCloudinarySignature({ timestamp });

  return {
    provider: 'cloudinary',
    uploadUrl: `https://api.cloudinary.com/v1_1/${cloudConfig.cloudinary.cloudName}/auto/upload`,
    params: {
      api_key: cloudConfig.cloudinary.apiKey,
      upload_preset: cloudConfig.cloudinary.unsignedPreset,
      timestamp,
      signature,
      folder: 'messages'
    }
  };
};

module.exports = {
  SUPPORTED_TYPES,
  generateSignedUpload
};