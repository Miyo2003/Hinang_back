MATCH (n:Notification {id: $id})
WITH n, properties(n) AS deletedNotification
DETACH DELETE n
RETURN deletedNotification
