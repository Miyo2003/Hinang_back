// models/jobModel.js
const path = require('path');
const loadQueries = require('../utils/cypherLoader');
const { retry } = require('../utils/retryUtils');

const queries = loadQueries(path.join(__dirname, '../queries/job'));

const executeQuery = async (queryName, params = {}) => {
  const session = global.__neo4jDriver.session();
  try {
    const query = queries[queryName];
    if (!query) throw new Error(`Query "${queryName}" not found in /queries/job`);

    const result = await retry(async () => await session.run(query, params));
    return result.records.map(record => {
      const recordObj = {};
      record.keys.forEach(key => {
        recordObj[key] = record.get(key);
      });
      return recordObj;
    });
  } catch (error) {
    console.error(`[jobModel] Error executing query '${queryName}':`, error);
    throw new Error(`[jobModel] ${error.message}`);
  } finally {
    await session.close();
  }
};

const jobModel = {
  createJob: async (jobData) => {
    const requiredFields = ['jobName', 'jobDescription', 'jobType', 'jobArea'];
    const missing = requiredFields.filter(f => !jobData[f]);
    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }

    const records = await executeQuery('createJob', {
      ...jobData,
      randomUUID: jobData.id || crypto.randomUUID(),
      createdAt: new Date().toISOString()
    });
    return records[0]?.job?.properties || null;
  },

  getJobs: async ({ page = 1, limit = 10, sortBy = 'createdAt', order = 'desc', jobType, jobArea }) => {
    const skip = (page - 1) * limit;
    const records = await executeQuery('getJob', { skip, limit, sortBy, order, jobType, jobArea });
    const countResult = await executeQuery('getJobCount', { jobType, jobArea });

    return {
      jobs: records.map(r => r.job.properties),
      pagination: {
        total: parseInt(countResult[0]?.count || '0'),
        pages: Math.ceil(parseInt(countResult[0]?.count || '0') / limit),
        current: page,
        limit
      }
    };
  },

  getJobById: async (id) => {
    const records = await executeQuery('getJobById', { id });
    const job = records[0]?.job?.properties;
    if (!job) throw new Error('Job not found');
    return job;
  },

  updateJobById: async (id, updates) => {
    const records = await executeQuery('updateJobById', { id, updates });
    return records[0]?.job?.properties || null;
  },

  deleteJobById: async (id) => {
    const records = await executeQuery('deleteJobById', { id });
    return records[0]?.deleteJob?.properties || null;
  },

  assignJobToUser: async (jobId, userId) => {
    const records = await executeQuery('assignJobToUser', { jobId, userId });
    return records[0] || null;
  },

  // Updated: Use APOC for safe dynamic node creation
  insertNodeToJob: async (id, label, props, relation) => {
    const allowedLabels = ['Location', 'Attachment', 'Skill', 'Requirement', 'Category'];
    const allowedRelations = ['HAS_LOCATION', 'HAS_ATTACHMENT', 'HAS_SKILL', 'HAS_REQUIREMENT', 'HAS_CATEGORY'];

    if (!allowedLabels.includes(label)) throw new Error(`Invalid label: ${label}`);
    if (!allowedRelations.includes(relation)) throw new Error(`Invalid relation: ${relation}`);

    const session = global.__neo4jDriver.session();
    try {
      const query = `
        MATCH (job:Job {id: $id})
        CALL apoc.create.node([apoc.text.capitalize($label)], $props) YIELD node AS n
        WITH job, n
        CALL apoc.create.relationship(job, apoc.text.upper($relation), {}, n) YIELD rel
        RETURN job, n
      `;
      const result = await retry(async () => await session.run(query, { id, label, props, relation }));
      const record = result.records[0];
      if (!record) return null;
      return {
        job: record.get('job')?.properties || null,
        node: record.get('n')?.properties || null
      };
    } finally {
      await session.close();
    }
  }
};

module.exports = jobModel;