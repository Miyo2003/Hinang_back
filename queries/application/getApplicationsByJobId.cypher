MATCH (job:Job {id: $jobId})<-[:FOR_JOB]-(app:Application)<-[:APPLIED_FOR]-(worker:Worker)
RETURN app, worker, job
