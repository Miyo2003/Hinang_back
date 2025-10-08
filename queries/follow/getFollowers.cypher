// Get followers for a user
MATCH (follower:User)-[:FOLLOWS]->(u:User {id: $userId})
RETURN follower
ORDER BY follower.username