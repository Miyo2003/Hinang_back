MATCH (job:Job {id: $id})
WITH job, properties(job) AS deleteUser
DETACH DELETE job
RETURN deleteUser