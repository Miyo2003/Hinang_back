MATCH (:Job {id: $jobId})-[:HAS_MILESTONE]->(milestone:Milestone {id: $milestoneId})
SET milestone.status = $escalationPayload.status,
    milestone.escalatedAt = datetime($escalationPayload.escalatedAt),
    milestone.escalatedBy = $escalationPayload.escalatedBy
RETURN milestone