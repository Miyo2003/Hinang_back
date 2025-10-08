// Unlike a post
MATCH (user:User {id: $userId})-[like:LIKED]->(post:Post {id: $postId})
DELETE like