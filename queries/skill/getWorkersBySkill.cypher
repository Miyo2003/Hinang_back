MATCH (worker:Worker)-[:HAS_SKILL]->(s:Skill {name: $skillName})
RETURN worker, s
