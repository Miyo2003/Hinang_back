MATCH (user:User {id: $userId})-[:HAS_WORKER]->(worker:Worker)
RETURN worker