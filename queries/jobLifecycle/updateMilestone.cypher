MATCH (job:Job {id: $jobId})-[:HAS_MILESTONE]->(milestone:Milestone {id: $milestoneId})
SET milestone += $updates
RETURN milestone