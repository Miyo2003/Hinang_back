MATCH (job:Job {id: $jobId})-[r:ASSIGNED_TO]->(worker:Worker {id: $workerId})
DELETE r
RETURN {jobId: $jobId, workerId: $workerId, message: 'Assignment deleted successfully'} as result