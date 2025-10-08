MATCH (user:User {id: $userId})
CREATE (n:Notification {
    id: randomUUID(),
    message: $message,
    type: $type,
    isRead: false,
    timestamp: datetime()
})
CREATE (user)-[:HAS_NOTIFICATION]->(n)
RETURN n, user
