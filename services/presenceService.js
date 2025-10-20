// services/presenceService.js
const driver = require('../db/neo4j');
const neo4j = require('neo4j-driver');
const { isFeatureEnabled } = require('../utils/featureToggle');

const presenceCache = new Map();

const persistPresence = async (userId, status) => {
  if (!isFeatureEnabled('presenceTrackingEnabled')) return;
  const session = driver.session();
  try {
    await session.run(
      `
      MATCH (u:User {id: $userId})
      SET u.lastSeenAt = datetime($lastSeenAt),
          u.isOnline = $isOnline
      RETURN u
      `,
      {
        userId,
        lastSeenAt: status.lastSeenAt,
        isOnline: status.isOnline
      }
    );
  } finally {
    await session.close();
  }
};

const setUserOnline = async (userId, { socketId, userAgent }) => {
  const now = new Date().toISOString();
  const entry = presenceCache.get(userId) || { sockets: new Set(), userAgent };
  entry.sockets.add(socketId);
  entry.userAgent = userAgent || entry.userAgent;
  entry.lastSeenAt = now;
  entry.isOnline = true;
  presenceCache.set(userId, entry);

  await persistPresence(userId, entry);
};

const setUserOffline = async (userId, socketId) => {
  const entry = presenceCache.get(userId);
  if (!entry) return;
  entry.sockets.delete(socketId);
  if (entry.sockets.size === 0) {
    entry.isOnline = false;
    entry.lastSeenAt = new Date().toISOString();
    await persistPresence(userId, entry);
  }
  presenceCache.set(userId, entry);
};

const touchUser = async (userId) => {
  const entry = presenceCache.get(userId);
  if (!entry) return;
  entry.lastSeenAt = new Date().toISOString();
  presenceCache.set(userId, entry);
  await persistPresence(userId, entry);
};

const getPresenceSnapshot = async () => {
  const snapshot = [];
  presenceCache.forEach((value, key) => {
    snapshot.push({
      userId: key,
      isOnline: value.isOnline,
      lastSeenAt: value.lastSeenAt,
      userAgent: value.userAgent
    });
  });
  return snapshot;
};

module.exports = {
  setUserOnline,
  setUserOffline,
  touchUser,
  getPresenceSnapshot
};