// Find nearby users within a radius
MATCH (u1:User {id: $userId})-[:HAS_LOCATION]->(l1:Location)
MATCH (u2:User)-[:HAS_LOCATION]->(l2:Location)
WHERE u1 <> u2
AND point.distance(
    point({latitude: l1.latitude, longitude: l1.longitude}),
    point({latitude: l2.latitude, longitude: l2.longitude})
) <= $radiusInMeters
RETURN u2, l2,
    point.distance(
        point({latitude: l1.latitude, longitude: l1.longitude}),
        point({latitude: l2.latitude, longitude: l2.longitude})
    ) as distance
ORDER BY distance