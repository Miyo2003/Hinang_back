const fs = require('fs');
const path = require('path');
const driver = require('../db/neo4j');

const loadQueries = () => {
    const queryDir = path.join(__dirname, '../queries/job'); // Fix typo here
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
      
      if (!query) {
        throw new Error(`Query ${queryName} not found`);
      }
      
      const result = await session.run(query, params);
      return result.records.map(record => {
        const recordObj = {};
        record.keys.forEach(key => {
          recordObj[key] = record.get(key);
        });
        return recordObj;
      });
    } catch (error) {
      console.error(`Error executing ${queryName}:`, error);
      throw error;
    } finally {
      await session.close();
    }
  };






const jobModel = {

    createJob: async (jobData) => {
      // Validate required fields
      const requiredFields = ['jobName', 'jobDescription', 'jobType', 'jobArea'];
      const missingFields = requiredFields.filter(field => !jobData[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      // Add default values and validate data
      const finalJobData = {
        ...jobData,
        randomUUID: jobData.id || crypto.randomUUID(),
        jobMedia: jobData.jobMedia || [],
        JobDuration: jobData.JobDuration || 'Not specified',
        createdAt: new Date().toISOString()
      };

      const records = await executeQuery('createJob', finalJobData);
      return records[0]?.job || null;
    },
  
    getJobs: async (params = {}) => {
      const {
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        order = 'desc',
        jobType,
        jobArea
      } = params;

      // Add query parameters for filtering
      const queryParams = {
        skip: (page - 1) * limit,
        limit: parseInt(limit),
        sortBy,
        order,
        jobType,
        jobArea
      };

      const records = await executeQuery('getJob', queryParams);
      const jobs = records.map(record => record.job);
      
      // Get total count for pagination
      const totalRecords = await executeQuery('getJobCount', { jobType, jobArea });
      const total = totalRecords[0]?.count || 0;

      return {
        jobs,
        pagination: {
          total,
          pages: Math.ceil(total / limit),
          current: page,
          limit
        }
      };
    },
  
    getJobById: async (id) => {
      if (!id) {
        throw new Error('Job ID is required');
      }

      const records = await executeQuery('getJobById', { id });
      const job = records[0]?.job;

      if (!job) {
        throw new Error('Job not found');
      }

      return job;
    },
  
    updateJob: async (id, jobData) => {
      const records = await executeQuery('updateJob', { id, ...jobData });
      return records[0]?.job || null;
    },
  
    updateJobById: async (id, updates) => {
      const records = await executeQuery('updateJobById', { id, updates });
      return records[0]?.job || null;
    },
  
    deleteJobs: async () => {
      return await executeQuery('deleteJob');
    },
  
    deleteJobById: async (id) => {
      const records = await executeQuery('deleteJobById', { id });
      return records[0]?.deleteJob || null;
    },
  
    assignJobToUser: async (jobId, userId) => {
      const records = await executeQuery('assignJobToUser', { jobId, userId });
      return records[0] || null;
    },
  
    insertNodeToJob: async (id, label, props, relation) => {
      const session = driver.session();
      try {
        const queries = loadQueries();
        let query = queries.insertNodeToJob;
        
        if (!query) {
          throw new Error('insertNodeToJob query not found');
        }
        
        query = query.replace('`${label}`', label);
        query = query.replace('`$relation`', relation);
        
        const result = await session.run(query, { id, props });
        const record = result.records[0];
        
        if (record) {
          return {
            job: record.get('job'),
            node: record.get('n')
          };
        }
        return null;
      } catch (error) {
        console.error('Error inserting node to job:', error);
        throw error;
      } finally {
        await session.close();
      }
    }
  };
  
  module.exports = jobModel;