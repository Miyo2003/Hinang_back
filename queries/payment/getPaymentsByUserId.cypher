MATCH (u:User {id: $userId})-[:HAS_CLIENT|:HAS_WORKER]->(entity)<-[:TO_WORKER|:PAID]-(p:Payment)
RETURN p, entity
