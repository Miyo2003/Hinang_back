// scheduler/index.js
const runOverdueMilestoneJob = require('./overdueMilestoneJob');

module.exports = (cron, features = {}) => {
  if (features.autoEscalationEnabled) {
    cron.schedule('0 2 * * *', async () => {
      console.log('[cron] Running overdue milestone job...');
      try {
        await runOverdueMilestoneJob();
        console.log('[cron] Overdue milestone job completed');
      } catch (err) {
        console.error('[cron] Overdue milestone job failed:', err);
      }
    });
  }
};