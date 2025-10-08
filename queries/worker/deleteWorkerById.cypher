MATCH (worker:Worker {id: $id})
WITH worker, properties(worker) AS deleteWorker
DETACH DELETE worker
RETURN deleteWorker