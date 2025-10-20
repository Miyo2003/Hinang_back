// utils/cypherLoader.js
const fs = require('fs');
const path = require('path');

const cache = new Map();

/**
 * Load and cache every Cypher file inside a directory.
 * @param {string} dirPath absolute filesystem path to a query folder
 * @returns {Record<string,string>}
 */
const loadQueries = (dirPath) => {
  if (cache.has(dirPath)) {
    return cache.get(dirPath);
  }

  const queryFiles = fs.readdirSync(dirPath);
  const queries = {};

  queryFiles
    .filter(file => file.endsWith('.cypher'))
    .forEach(file => {
      const queryName = path.basename(file, '.cypher');
      queries[queryName] = fs.readFileSync(path.join(dirPath, file), 'utf8');
    });

  cache.set(dirPath, queries);
  return queries;
};

module.exports = loadQueries;