MATCH (:Job {id: $jobId})-[:HAS_MILESTONE]->(milestone:Milestone)
RETURN milestone
ORDER BY milestone.dueDate