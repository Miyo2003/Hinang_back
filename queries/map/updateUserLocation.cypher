// Update or create a user's location
MATCH (u:User {id: $userId})
MERGE (u)-[:HAS_LOCATION]->(l:Location)
SET l = {
    latitude: $latitude,
    longitude: $longitude,
    address: $address,
    city: $city,
    country: $country,
    postalCode: $postalCode,
    updatedAt: datetime()
}
RETURN l