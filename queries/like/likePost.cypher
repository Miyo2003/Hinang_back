// Like a post
MATCH (post:Post {id: $postId})
MERGE (user:User {id: $userId})
MERGE (user)-[:LIKED]->(post)
RETURN post