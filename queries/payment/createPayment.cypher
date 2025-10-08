MATCH (job:Job {id: $jobId}), (client:Client {id: $clientId}), (worker:Worker {id: $workerId})
CREATE (p:Payment {
    id: randomUUID(),
    amount: $amount,
    status: $status,
    createdAt: datetime()
})
CREATE (client)-[:PAID]->(p)-[:FOR_JOB]->(job)
CREATE (p)-[:TO_WORKER]->(worker)
RETURN p, client, worker, job
