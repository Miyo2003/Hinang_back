MATCH (msg:Message {id: $messageId})
CREATE (att:MessageAttachment {
  id: randomUUID(),
  url: $attachment.url,
  type: $attachment.type,
  size: $attachment.size,
  duration: $attachment.duration,
  thumbnailUrl: $attachment.thumbnailUrl,
  createdAt: datetime()
})
MERGE (att)-[:BELONGS_TO]->(msg)
RETURN att AS attachment