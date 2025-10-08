// List posts by a specific user
MATCH (post:Post {userId: $userId})
RETURN post
ORDER BY post.createdAt DESC