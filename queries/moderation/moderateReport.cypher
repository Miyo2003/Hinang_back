// Update report status (for moderation)
MATCH (r:Report {id: $reportId})
MATCH (moderator:User {id: $moderatorId})
WHERE moderator.role = 'admin'
SET r += {
    status: $status,
    moderatedAt: datetime(),
    moderatorNotes: $notes
}
MERGE (moderator)-[:MODERATED]->(r)
RETURN r