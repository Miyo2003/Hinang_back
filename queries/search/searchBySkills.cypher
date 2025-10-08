// Search users by skills
MATCH (s:Skill)
WHERE toLower(s.name) CONTAINS toLower($searchQuery)
MATCH (u:User)-[:HAS_SKILL]->(s)
WHERE u.status = 'active'
RETURN DISTINCT u, collect(s.name) as skills
ORDER BY size(collect(s.name)) DESC
LIMIT $limit