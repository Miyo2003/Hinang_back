MATCH (job:Job {id: $jobId})-[:ASSIGNED_TO]->(worker:Worker)
RETURN worker, job
