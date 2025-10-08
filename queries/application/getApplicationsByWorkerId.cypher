MATCH (worker:Worker {id: $workerId})-[:APPLIED_FOR]->(app:Application)-[:FOR_JOB]->(job:Job)
RETURN app, job
