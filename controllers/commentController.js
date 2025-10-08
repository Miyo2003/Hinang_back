const commentModel = require('../models/commentModel');

const commentController = {
  create: async (req, res) => {
    try {
      const { postId, content } = req.body;
      const userId = req.user.id;
      const comment = await commentModel.create(userId, postId, content);
      res.json({ success: true, comment });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
  listForPost: async (req, res) => {
    try {
      const comments = await commentModel.listForPost(req.params.postId);
      res.json({ success: true, comments });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
  delete: async (req, res) => {
    try {
      // Only owner or admin can delete
      // (You may want to fetch the comment and check userId)
      // For now, assume only admin can delete
      if (req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Forbidden' });
      }
      await commentModel.delete(req.params.id);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
};

module.exports = commentController;
