// List comments for a post
MATCH (comment:Comment)-[:ON]->(post:Post {id: $postId})
RETURN comment
ORDER BY comment.createdAt ASC