// Create a new post
CREATE (post:Post {
    id: randomUUID(),
    userId: $userId,
    content: $content,
    createdAt: datetime()
})
RETURN post