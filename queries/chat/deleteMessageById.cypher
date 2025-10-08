MATCH (m:Message {id: $id})
WITH m, properties(m) AS deletedMessage
DETACH DELETE m
RETURN deletedMessage
