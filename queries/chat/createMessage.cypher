MATCH (sender:User {id: $senderId}), (receiver:User {id: $receiverId})
CREATE (message:Message {
    id: randomUUID(),
    content: $content,
    timestamp: datetime()
})
CREATE (sender)-[:SENT]->(message)
CREATE (message)-[:TO]->(receiver)
RETURN message, sender, receiver
