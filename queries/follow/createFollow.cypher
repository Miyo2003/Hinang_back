// Create a follow relationship between users
MATCH (follower:User {id: $followerId})
MATCH (following:User {id: $followingId})
WHERE follower <> following
MERGE (follower)-[r:FOLLOWS]->(following)
ON CREATE SET r.createdAt = datetime()
RETURN r