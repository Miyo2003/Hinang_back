// Remove a follow relationship
MATCH (follower:User {id: $followerId})-[r:FOLLOWS]->(following:User {id: $followingId})
DELETE r