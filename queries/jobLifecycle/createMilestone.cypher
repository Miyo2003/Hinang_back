MATCH (job:Job {id: $jobId})
CREATE (milestone:Milestone {
  id: randomUUID(),
  title: $payload.title,
  dueDate: datetime($payload.dueDate),
  status: $payload.status,
  notes: $payload.notes,
  createdAt: datetime($payload.createdAt),
  createdBy: $payload.createdBy
})
MERGE (job)-[:HAS_MILESTONE]->(milestone)
RETURN milestone