const postModel = require('../models/postModel');

const postController = {
  create: async (req, res) => {
    try {
      const { content } = req.body;
      const userId = req.user.id;
      const mediaFiles = req.files || []; // Handle multiple file uploads
      const post = await postModel.create(userId, content, mediaFiles);
      res.json({ success: true, post });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
  listFeed: async (req, res) => {
    try {
      const posts = await postModel.listFeed();
      res.json({ success: true, posts });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
  getById: async (req, res) => {
    try {
      const post = await postModel.getById(req.params.id);
      if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
      res.json({ success: true, post });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
  delete: async (req, res) => {
    try {
      const post = await postModel.getById(req.params.id);
      if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
      // Only owner or admin can delete
      if (req.user.role !== 'admin' && req.user.id !== post.userId) {
        return res.status(403).json({ success: false, message: 'Forbidden' });
      }
      await postModel.delete(req.params.id);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
  listByUser: async (req, res) => {
    try {
      const posts = await postModel.listByUser(req.params.userId);
      res.json({ success: true, posts });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
};

module.exports = postController;
