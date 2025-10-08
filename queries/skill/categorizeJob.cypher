MATCH (job:Job {id: $jobId})
MERGE (c:Category {name: $categoryName})
MERGE (job)-[:IN_CATEGORY]->(c)
RETURN job, c
