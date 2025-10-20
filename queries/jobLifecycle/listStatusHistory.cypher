MATCH (:Job {id: $jobId})-[:HAS_STATUS_HISTORY]->(status:JobStatus)
RETURN status
ORDER BY status.changedAt DESC