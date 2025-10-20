// services/pushService.js
const fetch = require('node-fetch');
const { isFeatureEnabled } = require('../utils/featureToggle');

const sendPush = async (userId, notification) => {
  if (!isFeatureEnabled('notificationIntegrationEnabled')) return;

  // Placeholder: integrate with FCM, APNS, Resend, etc.
  console.log(`[pushService] Would send push to ${userId}: ${notification.message}`);
};

module.exports = {
  sendPush
};