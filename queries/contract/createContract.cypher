// Create a new contract
MATCH (j:Job {id: $jobId})
MATCH (w:Worker {id: $workerId})
MATCH (c:Client)-[:POSTED]->(j)
CREATE (con:Contract {
    id: apoc.create.uuid(),
    price: $price,
    startDate: datetime(),
    status: 'active',
    terms: $terms,
    createdAt: datetime()
})
MERGE (w)-[:WORKS_ON]->(con)-[:FOR]->(j)
MERGE (c)-[:OWNS]->(con)
RETURN con