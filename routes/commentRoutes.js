const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Create a comment (any authenticated user)
router.post('/', authMiddleware, commentController.create);
// List comments for a post (any authenticated user)
router.get('/post/:postId', authMiddleware, commentController.listForPost);
// Delete comment (admin only for now)
router.delete('/:id', authMiddleware, commentController.delete);

module.exports = router;
