const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const attachmentController = require('../controllers/attachmentController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Make sure this directory exists
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
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