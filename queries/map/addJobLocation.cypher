MATCH (job:Job {id: $jobId})
CREATE (loc:Location {
    id: randomUUID(),
    latitude: $latitude,
    longitude: $longitude,
    address: $address
})
MERGE (job)-[:LOCATED_AT]->(loc)
RETURN job, loc
