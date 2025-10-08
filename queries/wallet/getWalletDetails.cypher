// Get wallet balance and transactions for a user
MATCH (u:User {id: $userId})-[:OWNS]->(w:Wallet)
OPTIONAL MATCH (w)<-[:TO]-(t:Transaction)
OPTIONAL MATCH (w)-[:FROM]->(t2:Transaction)
RETURN w.balance as balance, 
       w.currency as currency,
       collect(DISTINCT t) + collect(DISTINCT t2) as transactions
ORDER BY w.createdAt DESC