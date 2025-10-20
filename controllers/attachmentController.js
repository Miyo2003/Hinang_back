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
// controllers/attachmentController.js (excerpt)
const deleteAttachment = async (req, res) => {
  try {
    const { attachmentId } = req.params;

    const attachment = await AttachmentModel.getAttachmentById(attachmentId);
    if (!attachment) {
      return res.status(404).json({ message: 'Attachment not found' });
    }

    if (req.user.role !== 'admin' && attachment.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this attachment' });
    }

    await AttachmentModel.deleteAttachment(attachmentId);
    res.json({ message: 'Attachment deleted successfully' });
  } catch (error) {
    console.error('Error deleting attachment:', error);
    res.status(500).json({ message: 'Error deleting attachment' });
  }
};

module.exports = {
    uploadAttachment,
    deleteAttachment
};