MATCH (reviewer:User {id: $reviewerId})-[:WROTE]->(r:Review)-[:FOR]->(target:User)
RETURN r, target
ORDER BY r.timestamp DESC
