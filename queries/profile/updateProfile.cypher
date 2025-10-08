// Update user profile
MATCH (u:User {id: $userId})
MERGE (u)-[:HAS_PROFILE]->(p:Profile)
SET p += $profileData
RETURN p