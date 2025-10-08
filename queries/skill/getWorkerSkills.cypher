MATCH (w:Worker {id: $workerId})-[:HAS_SKILL]->(s:Skill)
RETURN s as skill