// models/attachmentModel.js
const path = require('path');
const driver = require('../db/neo4j');
const loadQueries = require('../utils/cypherLoader');
const { retry } = require('../utils/retryUtils');

const queries = loadQueries(path.join(__dirname, '../queries/attachment'));

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

class AttachmentModel {
  async createAttachment(ownerId, fileData) {
    if (!ownerId || !fileData.filename || !fileData.mimetype) {
      throw new Error('Owner ID and file data required');
    }
    const records = await executeQuery('createAttachment', {
      ownerId,
      filename: fileData.filename,
      fileType: fileData.mimetype,
      fileSize: fileData.size,
      url: fileData.url
    });
    return records[0]?.a?.properties || null;
  }

  async deleteAttachment(attachmentId) {
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
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    return allowedTypes.includes(mimetype);
  }

  validateFileSize(size) {
    const maxSize = 10 * 1024 * 1024; // 10MB
    return size <= maxSize;
  }
}

module.exports = new AttachmentModel();