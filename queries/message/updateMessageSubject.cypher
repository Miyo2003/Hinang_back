MATCH (msg:Message {id: $messageId})
SET msg.subject = $subject,
    msg.updatedAt = datetime(),
    msg.updatedBy = $updatedBy
RETURN msg AS message