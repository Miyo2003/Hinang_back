MATCH (job:Job {id: $jobId})<-[:FOR_JOB]-(p:Payment)
RETURN p, job
