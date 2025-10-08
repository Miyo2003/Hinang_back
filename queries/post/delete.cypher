// Delete a post by ID
MATCH (post:Post {id: $id})
DETACH DELETE post