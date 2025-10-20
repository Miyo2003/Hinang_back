MATCH (msg:Message {id: $id})
OPTIONAL MATCH (msg)<-[:BELONGS_TO]-(attachment:MessageAttachment)
OPTIONAL MATCH (msg)-[:REPLY_TO]->(replyMsg:Message)
RETURN msg AS message, collect(DISTINCT attachment) AS attachments, replyMsg AS replyTo