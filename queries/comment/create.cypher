// Create a comment on a post
MATCH (post:Post {id: $postId})
CREATE (comment:Comment {
    id: randomUUID(),
    userId: $userId,
    content: $content,
    createdAt: datetime()
})-[:ON]->(post)
RETURN comment