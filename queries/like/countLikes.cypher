// Count likes for a post
MATCH (user:User)-[:LIKED]->(post:Post {id: $postId})
RETURN count(user) AS likeCount