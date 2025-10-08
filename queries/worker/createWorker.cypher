MATCH (user:User {id: $userId})
CREATE (worker:Worker {
    id: randomUUID(),
    skills: $skills,
    hourlyRate: $hourlyRate,
    availability: $availability,
    startDate: $startDate,
    endDate: $endDate
})
CREATE (user)-[:HAS_WORKER]->(worker)
RETURN worker