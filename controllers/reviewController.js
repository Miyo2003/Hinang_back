// controllers/reviewController.js
const reviewModel = require('../models/reviewModel');

const reviewController = {
  // Create a review (worker or client can review each other after assignment)
  create: async (req, res) => {
    try {
      const { targetUserId, jobId, rating, comment } = req.body;

      const review = await reviewModel.createReview({
        reviewerId: req.user.id,
        targetUserId,
        jobId,
        rating,
        comment,
        timestamp: new Date().toISOString()
      });

      res.json({ success: true, review });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // Get reviews for a specific user (profile reviews)
  getByUser: async (req, res) => {
    try {
      const reviews = await reviewModel.getReviewsByUserId(req.params.userId);
      res.json({ success: true, reviews });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // Get reviews written by a user
  getByReviewer: async (req, res) => {
    try {
      const reviews = await reviewModel.getReviewsByReviewerId(req.params.reviewerId);
      res.json({ success: true, reviews });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // Delete a review (reviewer or admin only)
  delete: async (req, res) => {
    try {
      const result = await reviewModel.deleteReviewById(req.params.id);
      res.json({ success: true, result });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
};

module.exports = reviewController;
