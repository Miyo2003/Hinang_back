
const neo4j = require('neo4j-driver');


// Use only Aura credentials from .env
const uri = process.env.ITU_URI;
const user = process.env.ITU_USER;
const password = process.env.ITU_PASS;

if (!uri || !user || !password) {
  throw new Error('Missing Neo4j Aura credentials in .env: ITU_URI, ITU_USER, ITU_PASS');
}

let driver;
try {
  driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
} catch (err) {
  console.error('Failed to create Neo4j Aura driver:', err);
  throw err;
}

process.on('SIGINT', async () => {
  if (driver) {
    await driver.close();
    console.log('Neo4j driver closed');
  }
  process.exit(0);
});

module.exports = driver;
