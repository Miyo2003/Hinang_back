MATCH (job:Job)-[:LOCATED_AT]->(loc:Location)
RETURN job, loc

getJobLocationById.cypher
MATCH (job:Job {id: $jobId})-[:LOCATED_AT]->(loc:Location)
RETURN job, loc
