// Create a report
MATCH (reporter:User {id: $reporterId})
MATCH (reported {id: $reportedId})
WHERE reported:User OR reported:Post OR reported:Comment OR reported:Job
CREATE (r:Report {
    id: randomUUID(),
    reason: $reason,
    description: $description,
    status: 'pending',
    createdAt: datetime()
})
MERGE (reporter)-[:REPORTED]->(r)-[:REPORTS]->(reported)
RETURN r