// Delete a comment by ID
MATCH (comment:Comment {id: $id})
DETACH DELETE comment