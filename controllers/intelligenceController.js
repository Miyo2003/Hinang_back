// controllers/intelligenceController.js
const autoMatchingService = require('../services/intelligence/autoMatchingService');
const predictiveTimelineService = require('../services/intelligence/predictiveTimelineService');
const disputeAssistantService = require('../services/intelligence/disputeAssistantService');
const skillGapAnalyzerService = require('../services/intelligence/skillGapAnalyzerService');
const dynamicPricingService = require('../services/intelligence/dynamicPricingService');
const fraudDetectionService = require('../services/intelligence/fraudDetectionService');
const offlineSyncService = require('../services/offlineSyncService');
const achievementService = require('../services/achievementService');
const profileService = require('../services/profileService');
const recommendationService = require('../services/recommendationService');
const { assertFeatureEnabled } = require('../utils/featureToggle');

const intelligenceController = {
  autoMatch: async (req, res) => {
    try {
      assertFeatureEnabled('autoMatchingEnabled');
      const { jobId } = req.params;
      const suggestions = await autoMatchingService.getAutoMatchSuggestions({ jobId });
      res.json({ success: true, suggestions });
    } catch (err) {
      res.status(err.status || 500).json({ success: false, message: err.message });
    }
  },

  predictiveTimeline: async (req, res) => {
    try {
      const { jobId } = req.params;
      const estimate = await predictiveTimelineService.estimateTimeline({ jobId });
      res.json({ success: true, estimate });
    } catch (err) {
      res.status(err.status || 500).json({ success: false, message: err.message });
    }
  },

  disputeWorkflow: async (req, res) => {
    try {
      const { disputeType } = req.query;
      const workflow = disputeAssistantService.generateDisputeWorkflow({ disputeType });
      res.json({ success: true, workflow });
    } catch (err) {
      res.status(err.status || 500).json({ success: false, message: err.message });
    }
  },

  skillGap: async (req, res) => {
    try {
      const { workerId } = req.params;
      const gaps = await skillGapAnalyzerService.analyzeSkillGaps({ workerId });
      res.json({ success: true, gaps });
    } catch (err) {
      res.status(err.status || 500).json({ success: false, message: err.message });
    }
  },

  dynamicPricing: async (req, res) => {
    try {
      const { jobId } = req.params;
      const suggestion = await dynamicPricingService.suggestPrice({ jobId });
      res.json({ success: true, suggestion });
    } catch (err) {
      res.status(err.status || 500).json({ success: false, message: err.message });
    }
  },

  fraudCheck: async (req, res) => {
    try {
      const { paymentId } = req.params;
      await fraudDetectionService.runFraudCheck({ paymentId });
      res.json({ success: true });
    } catch (err) {
      res.status(err.status || 500).json({ success: false, message: err.message });
    }
  },

  offlineSync: async (req, res) => {
    try {
      const { since } = req.query;
      const data = await offlineSyncService.getSyncData({ userId: req.user.id, since });
      res.json({ success: true, data });
    } catch (err) {
      res.status(err.status || 500).json({ success: false, message: err.message });
    }
  },

  achievementJourney: async (req, res) => {
    try {
      const journey = await achievementService.getAchievementJourney({ userId: req.params.userId });
      res.json({ success: true, journey });
    } catch (err) {
      res.status(err.status || 500).json({ success: false, message: err.message });
    }
  },

  updateProfile: async (req, res) => {
    try {
      const profile = await profileService.updateProfile({ userId: req.user.id, profile: req.body });
      res.json({ success: true, profile });
    } catch (err) {
      res.status(err.status || 500).json({ success: false, message: err.message });
    }
  },

  recommendations: async (req, res) => {
    try {
      const { type } = req.query;
      const recs = await recommendationService.getRecommendations({ userId: req.user.id, type });
      res.json({ success: true, recommendations: recs });
    } catch (err) {
      res.status(err.status || 500).json({ success: false, message: err.message });
    }
  }
};

module.exports = intelligenceController;