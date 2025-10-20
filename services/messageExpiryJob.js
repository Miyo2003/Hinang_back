// scheduler/messageExpiryJob.js
const messageRetentionService = require('../services/messageRetentionService');

const runMessageExpiryJob = async () => {
  await messageRetentionService.purgeExpiredMessages();
};

module.exports = runMessageExpiryJob;