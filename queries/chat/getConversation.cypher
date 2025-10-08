MATCH (u1:User {id: $userId1})-[:SENT]->(m:Message)-[:TO]->(u2:User {id: $userId2})
RETURN m, u1, u2
UNION
MATCH (u2:User {id: $userId2})-[:SENT]->(m:Message)-[:TO]->(u1:User {id: $userId1})
RETURN m, u1, u2
ORDER BY m.timestamp ASC
