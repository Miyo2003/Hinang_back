MATCH ((job: Job {id : $id}))
CREATE (n: `${label}`)
SET n = $props 
MERGE (job)-[: `$relation`] ->(n)
RETURN job, n