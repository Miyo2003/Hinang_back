// Create a new service offering
MATCH (u:User {id: $userId})
CREATE (s:Service {
    id: apoc.create.uuid(),
    title: $title,
    description: $description,
    price: $price,
    category: $category,
    createdAt: datetime()
})
MERGE (u)-[:OFFERS]->(s)
RETURN s