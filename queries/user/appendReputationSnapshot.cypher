MATCH (user:User {id: $userId})
CREATE (snapshot:ReputationSnapshot {
  id: randomUUID(),
  score: $snapshot.score,
  averageRating: $snapshot.averageRating,
  totalReviews: $snapshot.totalReviews,
  jobCompletionRate: $snapshot.jobCompletionRate,
  recordedAt: datetime($snapshot.recordedAt)
})
MERGE (user)-[:HAS_REPUTATION_SNAPSHOT]->(snapshot)
RETURN snapshot