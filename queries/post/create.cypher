// Create a new post
CREATE (post:Post {
    id: randomUUID(),
    userId: $userId,
    content: $content,
    media: $media,
    createdAt: datetime()
})
RETURN post
