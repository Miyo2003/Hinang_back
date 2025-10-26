const express = require('express');
const router = express.Router();
const multer = require('multer');
const attachmentController = require('../controllers/attachmentController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Configure multer for memory storage (for Cloudinary upload)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

// Upload attachment - authenticated users only
router.post('/', 
    authMiddleware,
    upload.single('file'),
    attachmentController.uploadAttachment
);

// Delete attachment - authenticated users only (with ownership check in controller)
router.delete('/:attachmentId',
    authMiddleware,
    attachmentController.deleteAttachment
);

module.exports = router;