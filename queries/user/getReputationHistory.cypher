MATCH (:User {id: $userId})-[:HAS_REPUTATION_SNAPSHOT]->(snapshot:ReputationSnapshot)
RETURN snapshot
ORDER BY snapshot.recordedAt DESC