MATCH (worker:Worker {id: $workerId})
MERGE (s:Skill {name: $skillName})
MERGE (worker)-[:HAS_SKILL]->(s)
RETURN worker, s
