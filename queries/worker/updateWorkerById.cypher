MATCH (worker:Worker {id: $id})
SET worker += $updates
RETURN worker