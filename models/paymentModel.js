// models/paymentModel.js
const path = require('path');
const driver = require('../db/neo4j');
const loadQueries = require('../utils/cypherLoader');
const { retry } = require('../utils/retryUtils');

const queries = loadQueries(path.join(__dirname, '../queries/payment'));

const runQuery = async (name, params = {}) => {
  const session = driver.session();
  try {
    const query = queries[name];
    if (!query) throw new Error(`[paymentModel] Query "${name}" missing`);
    const result = await retry(async () => await session.run(query, params));
    return result.records;
  } finally {
    await session.close();
  }
};

const paymentModel = {
  createPayment: async ({ jobId, clientId, workerId, amount, method, status }) => {
    const records = await runQuery('createPayment', { jobId, clientId, workerId, amount, method, status });
    return records[0]?.p?.properties || null;
  },

  getPaymentsByJobId: async (jobId) => {
    const records = await runQuery('getPaymentsByJobId', { jobId });
    return records.map(r => r.p?.properties).filter(Boolean);
  },

  getPaymentsByUserId: async (userId) => {
    const records = await runQuery('getPaymentsByUserId', { userId });
    return records.map(r => r.p?.properties).filter(Boolean);
  },

  updatePaymentStatus: async (id, status) => {
    const records = await runQuery('updatePaymentStatus', { id, status });
    return records[0]?.p?.properties || null;
  },

  createEscrowPayment: async ({ jobId, paymentId, clientId, createdAt }) => {
    const records = await runQuery('createEscrowPayment', { jobId, paymentId, clientId, createdAt });
    return records[0]?.escrow?.properties || null;
  },

  releaseEscrow: async ({ jobId, escrowId, releasedBy, releasedAt }) => {
    const records = await runQuery('releaseEscrow', { jobId, escrowId, releasedBy, releasedAt });
    return records[0]?.result || null;
  },

  refundEscrow: async ({ jobId, escrowId, refundedBy, refundedAt, reason }) => {
    const records = await runQuery('refundEscrow', { jobId, escrowId, refundedBy, refundedAt, reason });
    return records[0]?.result || null;
  }
};

module.exports = paymentModel;