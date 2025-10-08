// Get a post by ID
MATCH (post:Post {id: $id})
RETURN post