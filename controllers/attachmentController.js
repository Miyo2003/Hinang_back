const AttachmentModel = require('../models/attachmentModel');

// Upload a new attachment
const uploadAttachment = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const { ownerId } = req.body;
        if (!ownerId) {
            return res.status(400).json({ message: 'Owner ID is required' });
        }

        // Validate file type and size
        if (!AttachmentModel.validateFileType(req.file.mimetype)) {
            return res.status(400).json({ message: 'Invalid file type' });
        }

        if (!AttachmentModel.validateFileSize(req.file.size)) {
            return res.status(400).json({ message: 'File size exceeds limit' });
        }

        // Add file URL (this would typically come from your file storage service)
        const fileData = {
            ...req.file,
            url: `/uploads/${req.file.filename}` // Example URL, adjust based on your setup
        };

        const attachment = await AttachmentModel.createAttachment(ownerId, fileData);
        res.status(201).json(attachment);
    } catch (error) {
        console.error('Error uploading attachment:', error);
        res.status(500).json({ message: 'Error uploading attachment' });
    }
};

// Delete an attachment
const deleteAttachment = async (req, res) => {
    try {
        const { attachmentId } = req.params;

        // Here you might want to check ownership before deletion
        // This would require additional query to check if the user owns the attachment

        const deleted = await AttachmentModel.deleteAttachment(attachmentId);
        if (deleted) {
            res.json({ message: 'Attachment deleted successfully' });
        } else {
            res.status(404).json({ message: 'Attachment not found' });
        }
    } catch (error) {
        console.error('Error deleting attachment:', error);
        res.status(500).json({ message: 'Error deleting attachment' });
    }
};

module.exports = {
    uploadAttachment,
    deleteAttachment
};