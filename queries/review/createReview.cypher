MATCH (reviewer:User {id: $reviewerId}), (target:User {id: $targetId})
CREATE (r:Review {
    id: randomUUID(),
    rating: $rating,
    comment: $comment,
    timestamp: datetime()
})
CREATE (reviewer)-[:WROTE]->(r)-[:FOR]->(target)
RETURN r, reviewer, target
