// scheduler/overdueMilestoneJob.js
const driver = require('../db/neo4j');
const jobLifecycleModel = require('../models/jobLifecycleModel');
const { queueNotification } = require('../services/notificationDispatcher');

const runOverdueMilestoneJob = async () => {
  const session = driver.session();
  try {
    const lock = await session.run(`
      MERGE (l:Lock {name: 'overdueMilestoneJob'})
      SET l.lockedAt = datetime()
      RETURN l
    `);
    if (lock.records[0].get('l').properties.lockedAt !== new Date().toISOString()) return; // Locked by another instance

    const nowISO = new Date().toISOString();
    const overdue = await jobLifecycleModel.findOverdueMilestones(nowISO);

    for (const record of overdue) {
      const { milestone, job, clientId, workerIds } = record;

      await jobLifecycleModel.escalateMilestone(job.id, milestone.id, {
        escalatedAt: nowISO,
        escalatedBy: 'system',
        status: 'escalated'
      });

      queueNotification({
        userId: clientId,
        type: 'milestone',
        message: `Milestone "${milestone.title}" is overdue and has been escalated`,
        link: `/jobs/${job.id}`
      });

      workerIds.forEach(workerId => {
        queueNotification({
          userId: workerId,
          type: 'milestone',
          message: `Milestone "${milestone.title}" for job "${job.jobName}" is overdue`,
          link: `/jobs/${job.id}`
        });
      });
    }
  } finally {
    await session.run(`MATCH (l:Lock {name: 'overdueMilestoneJob'}) DELETE l`);
    await session.close();
  }
};

module.exports = runOverdueMilestoneJob;