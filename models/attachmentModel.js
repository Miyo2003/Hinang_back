// models/attachmentModel.js
const path = require('path');
const driver = require('../db/neo4j');
const loadQueries = require('../utils/cypherLoader');
const { retry } = require('../utils/retryUtils');
const { uploadToCloudinary, deleteFromCloudinary } = require('../services/cloudinaryService');

const queries = loadQueries(path.join(__dirname, '../queries/attachment'));

const executeQuery = async (queryName, params = {}) => {
  const session = global.__neo4jDriver.session();
  try {
    const query = queries[queryName];
    if (!query) throw new Error(`Query "${queryName}" not found`);
    const result = await retry(async () => await session.run(query, params));
    return result.records.map(record => {
      const obj = {};
      record.keys.forEach(key => obj[key] = record.get(key));
      return obj;
    });
  } finally {
    await session.close();
  }
};

class AttachmentModel {
  async createAttachment(ownerId, fileBuffer, fileData) {
    if (!ownerId || !fileData.originalname || !fileData.mimetype) {
      throw new Error('Owner ID and file data required');
    }

    // Upload to Cloudinary
    const cloudinaryResult = await uploadToCloudinary(fileBuffer, {
      public_id: `${ownerId}_${Date.now()}_${fileData.originalname}`,
      folder: 'attachments'
    });

    const records = await executeQuery('createAttachment', {
      ownerId,
      filename: fileData.originalname,
      fileType: fileData.mimetype,
      fileSize: fileData.size,
      url: cloudinaryResult.secure_url,
      publicId: cloudinaryResult.public_id
    });
    return records[0]?.a?.properties || null;
  }

  async deleteAttachment(attachmentId) {
    // Get attachment to retrieve publicId for Cloudinary deletion
    const attachment = await this.getAttachmentById(attachmentId);
    if (!attachment) {
      throw new Error('Attachment not found');
    }

    // Delete from Cloudinary if publicId exists
    if (attachment.publicId) {
      try {
        await deleteFromCloudinary(attachment.publicId);
      } catch (error) {
        console.error('Error deleting from Cloudinary:', error);
        // Continue with database deletion even if Cloudinary deletion fails
      }
    }

    const records = await executeQuery('deleteAttachment', { attachmentId });
    return records[0]?.result || null;
  }

  async getAttachmentById(attachmentId) {
    const records = await executeQuery('getAttachmentById', { attachmentId });
    return records[0]?.a?.properties || null;
  }

  validateFileType(mimetype) {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    return allowedTypes.includes(mimetype);
  }

  validateFileSize(size) {
    const maxSize = 10 * 1024 * 1024; // 10MB
    return size <= maxSize;
  }
}

module.exports = new AttachmentModel();
