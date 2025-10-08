// Get services by user
MATCH (u:User {id: $userId})-[:OFFERS]->(s:Service)
RETURN s
ORDER BY s.createdAt DESC