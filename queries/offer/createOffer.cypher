// Create a new offer for a job
MATCH (j:Job {id: $jobId})
MATCH (w:Worker)-[:HAS_PROFILE]->(p:Profile)
WHERE w.id = $workerId
CREATE (o:Offer {
    id: apoc.create.uuid(),
    price: $price,
    description: $description,
    status: 'pending',
    createdAt: datetime()
})
MERGE (w)-[:MADE]->(o)-[:FOR]->(j)
RETURN o