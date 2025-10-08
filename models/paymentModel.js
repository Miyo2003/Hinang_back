const fs = require('fs');
const path = require('path');
const driver = require('../db/neo4j');

const loadQueries = () => {
  const queryDir = path.join(__dirname, '../queries/payment');
  const queryFiles = fs.readdirSync(queryDir);
  const queries = {};
  queryFiles.forEach(file => {
    const queryName = path.basename(file, '.cypher');
    queries[queryName] = fs.readFileSync(path.join(queryDir, file), 'utf8');
  });
  return queries;
};

const executeQuery = async (queryName, params = {}) => {
  const session = driver.session();
  try {
    const queries = loadQueries();
    const query = queries[queryName];
    const result = await session.run(query, params);
    return result.records.map(record => {
      const obj = {};
      record.keys.forEach(key => obj[key] = record.get(key));
      return obj;
    });
  } finally { await session.close(); }
};

const paymentModel = {
  createPayment: async (jobId, clientId, workerId, amount, status) => {
    const records = await executeQuery('createPayment', { jobId, clientId, workerId, amount, status });
    return records[0]?.p || null;
  },
  getPaymentsByJobId: async (jobId) => {
    const records = await executeQuery('getPaymentsByJobId', { jobId });
    return records.map(r => r.p);
  },
  getPaymentsByUserId: async (userId) => {
    const records = await executeQuery('getPaymentsByUserId', { userId });
    return records.map(r => r.p);
  }
};

module.exports = paymentModel;
