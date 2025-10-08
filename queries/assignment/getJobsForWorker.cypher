MATCH (worker:Worker {id: $workerId})<-[:ASSIGNED_TO]-(job:Job)
RETURN job, worker
