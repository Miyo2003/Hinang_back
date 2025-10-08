// Get user profile with optional relationships
MATCH (u:User {id: $userId})
OPTIONAL MATCH (u)-[:HAS_PROFILE]->(p:Profile)
OPTIONAL MATCH (u)-[:HAS_SKILL]->(s:Skill)
OPTIONAL MATCH (u)-[:WORKS_AS]->(w:Worker)
OPTIONAL MATCH (u)-[:OWNS]->(c:Client)
RETURN u, p, collect(DISTINCT s) as skills, w, c