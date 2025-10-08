const neo4j = require('../db/neo4j');
const fs = require('fs').promises;
const path = require('path');

class AttachmentModel {
    constructor() {
        this.createAttachmentQuery = fs.readFile(path.join(__dirname, '../queries/attachment/createAttachment.cypher'), 'utf8');
        this.deleteAttachmentQuery = fs.readFile(path.join(__dirname, '../queries/attachment/deleteAttachment.cypher'), 'utf8');
    }

    async createAttachment(ownerId, fileData) {
        const session = neo4j.session();
        try {
            const query = await this.createAttachmentQuery;
            const result = await session.run(query, {
                ownerId,
                filename: fileData.filename,
                fileType: fileData.mimetype,
                fileSize: fileData.size,
                url: fileData.url
            });
            return result.records[0]?.get('a').properties || null;
        } finally {
            await session.close();
        }
    }

    async deleteAttachment(attachmentId) {
        const session = neo4j.session();
        try {
            const query = await this.deleteAttachmentQuery;
            await session.run(query, { attachmentId });
            return true;
        } finally {
            await session.close();
        }
    }

    // Helper method to validate file types
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

    // Helper method to validate file size (max 10MB)
    validateFileSize(size) {
        const maxSize = 10 * 1024 * 1024; // 10MB in bytes
        return size <= maxSize;
    }
}

module.exports = new AttachmentModel();