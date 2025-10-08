MATCH (user:User {id: $userId})-[:HAS_CLIENT]->(client:Client)
RETURN client