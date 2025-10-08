MATCH (user:User {id: $userId})-[:HAS_NOTIFICATION]->(n:Notification)
RETURN n
ORDER BY n.timestamp DESC
