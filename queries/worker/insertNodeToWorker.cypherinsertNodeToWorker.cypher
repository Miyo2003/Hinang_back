MATCH (worker:Worker {id: $id})
CREATE (n: `${label}`)
SET n = $props 
MERGE (worker)-[: `$relation`] ->(n)
RETURN worker, n