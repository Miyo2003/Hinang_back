MATCH ((user: User {id : $id}))
CREATE (n: `${label}`)
SET n = $props 
MERGE (user)-[: `$relation`] ->(n)
RETURN user, n