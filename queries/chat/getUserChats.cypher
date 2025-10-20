MATCH (u:User {id: $userId})-[:PARTICIPATES_IN]->(c:Chat)-[:HAS_MESSAGE]->(m:Message)
WITH c, max(m.createdAt) AS lastMessageTime, u
MATCH (c)-[:PARTICIPATES_IN]-(p:User) WHERE p <> u
RETURN p AS partner, lastMessageTime
ORDER BY lastMessageTime ${$order}
SKIP $offset
LIMIT $limit