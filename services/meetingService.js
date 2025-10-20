// services/meetingService.js
const { google } = require('googleapis');
const driver = require('../db/neo4j');
const { queueNotification } = require('./notificationDispatcher');

const calendar = google.calendar({
  version: 'v3',
  auth: process.env.GOOGLE_CALENDAR_API_KEY
});

const suggestSlots = async ({ jobId, participants }) => {
  const session = driver.session();
  try {
    const result = await session.run(
      `
      MATCH (job:Job {id: $jobId})-[:INVOLVES]->(participant:User)
      WHERE participant.id IN $participants
      RETURN participant.id AS userId, participant.timezone AS timezone
      `,
      { jobId, participants }
    );

    const participantsData = result.records.map(r => ({
      userId: r.get('userId'),
      timezone: r.get('timezone') || 'UTC'
    }));

    const suggestions = participantsData.map((participant, index) => ({
      id: `suggestion-${index}`,
      start: new Date(Date.now() + (index + 1) * 3600 * 1000).toISOString(),
      end: new Date(Date.now() + (index + 1) * 3600 * 1000 + 3600 * 1000).toISOString(),
      participants: participantsData.map(p => p.userId)
    }));

    return suggestions;
  } finally {
    await session.close();
  }
};

const confirmMeeting = async ({ meetingId, confirmedSlot, confirmedBy }) => {
  queueNotification({
    userId: confirmedBy,
    type: 'meeting',
    message: `Meeting confirmed for ${confirmedSlot}`,
    link: `/meetings/${meetingId}`
  });

  return {
    meetingId,
    confirmedSlot,
    confirmedBy
  };
};

module.exports = {
  suggestSlots,
  confirmMeeting
};