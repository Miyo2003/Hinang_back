// Get users being followed by a user
MATCH (u:User {id: $userId})-[:FOLLOWS]->(following:User)
RETURN following
ORDER BY following.username