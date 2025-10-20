// controllers/meetingController.js
const meetingService = require('../services/meetingService');
const { assertFeatureEnabled } = require('../utils/featureToggle');

const meetingController = {
  suggestSlots: async (req, res) => {
    try {
      assertFeatureEnabled('meetingSchedulerEnabled');
      const { jobId, participants } = req.body;
      const suggestions = await meetingService.suggestSlots({ jobId, participants });
      res.json({ success: true, suggestions });
    } catch (err) {
      res.status(err.status || 500).json({ success: false, message: err.message });
    }
  },

  confirmMeeting: async (req, res) => {
    try {
      assertFeatureEnabled('meetingSchedulerEnabled');
      const { meetingId } = req.params;
      const { confirmedSlot } = req.body;
      const meeting = await meetingService.confirmMeeting({ meetingId, confirmedSlot, confirmedBy: req.user.id });
      res.json({ success: true, meeting });
    } catch (err) {
      res.status(err.status || 500).json({ success: false, message: err.message });
    }
  }
};

module.exports = meetingController;