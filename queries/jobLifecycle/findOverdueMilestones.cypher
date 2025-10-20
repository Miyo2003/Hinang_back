MATCH (client:User {role: 'client'})-[:POSTED]->(job:Job)-[:HAS_MILESTONE]->(milestone:Milestone)
OPTIONAL MATCH (job)<-[:ASSIGNED_TO]-(worker:Worker)-[:OWNED_BY]->(wUser:User)
WHERE milestone.status = 'pending'
  AND milestone.dueDate < datetime($nowISO)
WITH milestone, job, client, collect(DISTINCT wUser) AS workers
RETURN milestone, job, client, workers