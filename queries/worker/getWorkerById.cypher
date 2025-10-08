MATCH (worker:Worker {id: $id})
OPTIONAL MATCH (worker)<-[:HAS_WORKER]-(user:User)
RETURN worker, user