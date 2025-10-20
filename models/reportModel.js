// models/reportModel.js
const path = require('path');
const driver = require('../db/neo4j');
const loadQueries = require('../utils/cypherLoader');
const { retry } = require('../utils/retryUtils');

const queries = loadQueries(path.join(__dirname, '../queries/report'));

const executeQuery = async (queryName, params = {}) => {
  const session = driver.session();
  try {
    const query = queries[queryName];
    if (!query) throw new Error(`Query "${queryName}" not found`);
    const result = await retry(async () => await session.run(query, params));
    return result.records.map(record => {
      const obj = {};
      record.keys.forEach(key => obj[key] = record.get(key));
      return obj;
    });
  } finally {
    await session.close();
  }
};

class ReportModel {
  async createReport(reporterId, reportedId, reportData) {
    const { reason, description } = reportData;
    if (!reason) throw new Error('Reason is required');
    const records = await executeQuery('createReport', { reporterId, reportedId, reason, description });
    return records[0]?.r?.properties || null;
  }

  async moderateReport(reportId, moderatorId, moderationData) {
    const { status, notes } = moderationData;
    if (!status) throw new Error('Status is required');
    const validStatuses = ['pending', 'accepted', 'rejected'];
    if (!validStatuses.includes(status)) throw new Error('Invalid moderation status');
    const records = await executeQuery('moderateReport', { reportId, moderatorId, status, notes });
    return records[0]?.r?.properties || null;
  }

  validateReportReason(reason) {
    const validReasons = ['spam', 'harassment', 'inappropriate_content', 'fake_account', 'violence', 'other'];
    return validReasons.includes(reason);
  }
}

module.exports = new ReportModel();