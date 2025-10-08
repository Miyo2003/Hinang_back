// Search across multiple node types
CALL db.index.fulltext.queryNodes("contentIndex", $searchQuery) YIELD node, score
WITH node, score
WHERE (node:Post OR node:Job OR node:User OR node:Service)
AND (
    CASE 
        WHEN node:Post OR node:Job OR node:Service
        THEN true  // Public content always visible
        WHEN node:User 
        THEN node.status = 'active'  // Only show active users
        ELSE false
    END
)
RETURN node, score, labels(node) as type
ORDER BY score DESC
LIMIT $limit