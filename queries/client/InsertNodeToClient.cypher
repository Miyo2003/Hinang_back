MATCH (client: Client {id: $id})
CREATE (n: `${label}`)
SET n = $props
MERGE (client)-[: `$relation`] ->(n)
RETURN client, n