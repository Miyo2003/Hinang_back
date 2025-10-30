// Create a comment on a post
MATCH (post:Post {id: $postId})
CREATE (comment:Comment {
    id: randomUUID(),
    userId: $userId,
    content: $content,
    media: $media,
    createdAt: datetime()
})-[:ON]->(post)
RETURN comment
