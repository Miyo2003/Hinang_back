MATCH (chat:Chat {id: $chatId})
MATCH (chat)-[:HAS_MESSAGE]->(message:Message)
WHERE message.deletedAt IS NULL
OPTIONAL MATCH (message)-[:SENT_BY]->(sender:User)
OPTIONAL MATCH (message)-[:HAS_ATTACHMENT]->(attachment:Attachment)
OPTIONAL MATCH (message)-[:REPLY_TO]->(replyTo:Message)
WITH message, sender, collect(attachment) as attachments, replyTo
ORDER BY message.createdAt DESC
LIMIT $limit
RETURN message, sender, attachments, replyTo
