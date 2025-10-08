MATCH (worker:Worker {id: $workerId}), (job:Job {id: $jobId})
CREATE (job)-[:ASSIGNED_TO]->(worker)
RETURN job, worker
