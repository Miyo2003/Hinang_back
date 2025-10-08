// List posts for the feed (simple version: all posts, newest first)
MATCH (post:Post)
RETURN post
ORDER BY post.createdAt DESC
LIMIT 50