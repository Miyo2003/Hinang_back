MATCH (me:User {id: $userId})-[:SENT]->(m:Message)-[:TO]->(partner:User)
WITH partner, max(m.timestamp) AS lastMessageTime
RETURN partner, lastMessageTime
ORDER BY lastMessageTime DESC
