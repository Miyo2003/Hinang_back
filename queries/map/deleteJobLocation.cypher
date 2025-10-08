MATCH (job:Job {id: $jobId})-[:LOCATED_AT]->(loc:Location)
DETACH DELETE loc
RETURN job
