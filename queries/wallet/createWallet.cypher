// Create a new wallet for a user
MATCH (u:User {id: $userId})
CREATE (w:Wallet {
    id: randomUUID(),
    balance: 0,
    currency: $currency,
    createdAt: datetime()
})
MERGE (u)-[:OWNS]->(w)
RETURN w