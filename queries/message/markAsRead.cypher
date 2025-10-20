MATCH (msg:Message {id: $messageId})
MERGE (reader:User {id: $readerId})
MERGE (msg)<-[rel:READ]-(reader)
SET rel.readAt = datetime($readAt)
RETURN msg AS message