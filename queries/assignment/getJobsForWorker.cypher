MATCH (w:Worker {id: $workerId})-[:ASSIGNED_TO]->(j:Job)
RETURN collect(j) as jobs