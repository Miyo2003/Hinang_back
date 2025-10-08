MATCH (n:Notification {id: $id})
SET n.isRead = true
RETURN n
