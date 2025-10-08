MATCH (target:User {id: $userId})<-[:FOR]-(r:Review)<-[:WROTE]-(reviewer:User)
RETURN r, reviewer
ORDER BY r.timestamp DESC
