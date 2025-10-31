// Get profile overview data for worker dashboard
MATCH (u:User {id: $userId})-[:WORKS_AS]->(w:Worker)
OPTIONAL MATCH (w)-[:ASSIGNED_TO]->(j:Job)
WHERE j.status IN ['active', 'in_progress']
WITH u, w, count(j) as activeAssignments
OPTIONAL MATCH (w)-[:ASSIGNED_TO]->(j2:Job)-[:HAS_PAYMENT]->(p:Payment)
WHERE p.status = 'completed' AND date(p.createdAt).year = date().year AND date(p.createdAt).month = date().month
WITH u, w, activeAssignments, sum(p.amount) as weeklyEarnings
OPTIONAL MATCH (w)-[:ASSIGNED_TO]->(j3:Job)
WHERE j3.status IN ['active', 'in_progress']
WITH u, w, activeAssignments, weeklyEarnings, collect(j3)[0] as nextJob
RETURN u, w, activeAssignments, weeklyEarnings, nextJob
