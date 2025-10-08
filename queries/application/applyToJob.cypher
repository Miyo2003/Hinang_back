MATCH (worker:Worker {id: $workerId}), (job:Job {id: $jobId})
CREATE (app:Application {
    id: randomUUID(),
    status: "pending",
    appliedAt: datetime()
})
CREATE (worker)-[:APPLIED_FOR]->(app)-[:FOR_JOB]->(job)
RETURN app, worker, job
