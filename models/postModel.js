const path = require('path');
const driver = require('../db/neo4j');
const loadQueries = require('../utils/cypherLoader');
const { retry } = require('../utils/retryUtils');
const { uploadToCloudinary, deleteFromCloudinary } = require('../services/cloudinaryService');

const queries = loadQueries(path.join(__dirname, '../queries/post'));

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

const postModel = {
  create: async (userId, content, mediaFiles = []) => {
    if (!content || content.trim().length === 0) throw new Error('Content cannot be empty');

    // Upload media files to Cloudinary
    const mediaAttachments = [];
    for (const file of mediaFiles) {
      const cloudinaryResult = await uploadToCloudinary(file.buffer, {
        public_id: `${userId}_post_${Date.now()}_${file.originalname}`,
        folder: 'posts'
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
      content,
      media: mediaAttachments
    });
    return records[0]?.post?.properties || null;
  },

  listFeed: async () => {
    const records = await executeQuery('listFeed');
    return records.map(r => r.post?.properties).filter(Boolean);
  },

  getById: async (id) => {
    const records = await executeQuery('getById', { id });
    return records[0]?.post?.properties || null;
  },

  delete: async (id) => {
    // Get post to retrieve media publicIds for Cloudinary deletion
    const post = await this.getById(id);
    if (post && post.media) {
      for (const media of post.media) {
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

  listByUser: async (userId) => {
    const records = await executeQuery('listByUser', { userId });
    return records.map(r => r.post?.properties).filter(Boolean);
  }
};

module.exports = postModel;
