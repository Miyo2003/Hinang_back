MATCH (user:User {id: $userId})
CREATE (client:Client {
    id: randomUUID(),
    clientType: $clientType,
    serviceRequired: $serviceRequired,
    budget: $budget,
    contactPerson: $contactPerson,
    contactPreference: $contactPreference
})
CREATE (user)-[:HAS_CLIENT]->(client)
RETURN client