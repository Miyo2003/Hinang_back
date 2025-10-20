MATCH (chat:Chat {id: $chatId})
MATCH (sender:User {id: $senderId})
CREATE (msg:Message {
  id: randomUUID(),
  content: $content,
  createdAt: datetime($createdAt),
  updatedAt: datetime($createdAt),
  senderId: $senderId,
  mentions: $mentions,
  hashtags: $hashtags,
  subject: $subject,
  expiresAt: CASE WHEN $expiresAt IS NULL THEN NULL ELSE datetime($expiresAt) END
})
MERGE (msg)-[:IN_CHAT]->(chat)
MERGE (sender)-[:SENT]->(msg)
WITH msg, chat, sender
CALL {
  WITH msg, sender, $replyTo AS replyToId
  OPTIONAL MATCH (replyMsg:Message {id: replyToId})
  CALL apoc.do.when(
    replyToId IS NOT NULL AND replyMsg IS NOT NULL,
    '
      MERGE (msg)-[:REPLY_TO]->(replyMsg)
      RETURN replyMsg
    ',
    '
      RETURN NULL
    ',
    {msg: msg, replyMsg: replyMsg}
  ) YIELD value
  RETURN value.replyMsg AS replyTo
}
RETURN msg AS message, [] AS attachments