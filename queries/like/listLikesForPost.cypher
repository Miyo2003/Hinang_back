// List users who liked a post
MATCH (user:User)-[:LIKED]->(post:Post {id: $postId})
RETURN user