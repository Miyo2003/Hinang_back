const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Create a post (any authenticated user)
router.post('/', authMiddleware, postController.create);
// List feed (any authenticated user)
router.get('/feed', authMiddleware, postController.listFeed);
// Get post by ID (any authenticated user)
router.get('/:id', authMiddleware, postController.getById);
// Delete post (owner or admin)
router.delete('/:id', authMiddleware, postController.delete);
// List posts by user (any authenticated user)
router.get('/user/:userId', authMiddleware, postController.listByUser);

module.exports = router;
