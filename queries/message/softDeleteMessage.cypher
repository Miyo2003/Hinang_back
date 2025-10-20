MATCH (msg:Message {id: $messageId})
SET msg.deletedAt = datetime(),
    msg.deletedBy = $deletedBy
RETURN msg AS message