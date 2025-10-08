MATCH (user:User {id: $userId})-[:SENT]->(message:Message)
OPTIONAL MATCH (message)-[:TO]->(receiver:User)
RETURN message, receiver
ORDER BY message.timestamp ASC
