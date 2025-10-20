MATCH (job:Job {id: $jobId})
CREATE (status:JobStatus {
  id: randomUUID(),
  status: $statusPayload.status,
  reason: $statusPayload.reason,
  changedBy: $statusPayload.changedBy,
  changedAt: datetime($statusPayload.changedAt)
})
MERGE (job)-[:HAS_STATUS_HISTORY]->(status)
RETURN status