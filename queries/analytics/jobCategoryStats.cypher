MATCH (j:Job)-[:BELONGS_TO_CATEGORY]->(c:Category)
OPTIONAL MATCH (j)<-[:TRACKS_PAYMENT]-(p:Payment {status: 'completed'})
RETURN c.name AS category, count(DISTINCT j) AS jobs, sum(p.amount) AS totalAmount
ORDER BY totalAmount DESC