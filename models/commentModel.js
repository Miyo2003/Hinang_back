const path = require('path');
const driver = require('../db/neo4j');
const loadQueries = require('../utils/cypherLoader');
const { retry } = require('../utils/retryUtils');
const { uploadToCloudinary, deleteFromCloudinary } = require('../services/cloudinaryService');

const queries = loadQueries(path.join(__dirname, '../queries/comment'));

const executeQuery = async (queryName, params = {}) => {
  const session = driver.session();
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

const commentModel = {
  create: async (userId, postId, content, mediaFiles = []) => {
    if (!content || content.trim().length === 0) throw new Error('Content cannot be empty');

    // Upload media files to Cloudinary
    const mediaAttachments = [];
    for (const file of mediaFiles) {
      const cloudinaryResult = await uploadToCloudinary(file.buffer, {
        public_id: `${userId}_comment_${Date.now()}_${file.originalname}`,
        folder: 'comments'
      });
      mediaAttachments.push({
        url: cloudinaryResult.secure_url,
        publicId: cloudinaryResult.public_id,
        type: file.mimetype,
        size: file.size,
        filename: file.originalname
      });
    }

    const records = await executeQuery('create', {
      userId,
      postId,
      content,
      media: mediaAttachments
    });
    return records[0]?.comment?.properties || null;
  },

  listForPost: async (postId) => {
    const records = await executeQuery('listForPost', { postId });
    return records.map(r => r.comment?.properties).filter(Boolean);
  },

  delete: async (id) => {
    // Get comment to retrieve media publicIds for Cloudinary deletion
    const comment = await this.getById(id);
    if (comment && comment.media) {
      for (const media of comment.media) {
        if (media.publicId) {
          try {
            await deleteFromCloudinary(media.publicId);
          } catch (error) {
            console.error('Error deleting media from Cloudinary:', error);
          }
        }
      }
    }

    await executeQuery('delete', { id });
    return true;
  },

  getById: async (id) => {
    const records = await executeQuery('getById', { id });
    return records[0]?.comment?.properties || null;
  }
};

module.exports = commentModel;
