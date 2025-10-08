// Create a new transaction between wallets
MATCH (fromWallet:Wallet {id: $fromWalletId})
MATCH (toWallet:Wallet {id: $toWalletId})
CREATE (t:Transaction {
    id: randomUUID(),
    amount: $amount,
    currency: fromWallet.currency,
    type: $type,
    description: $description,
    status: 'pending',
    createdAt: datetime()
})
MERGE (fromWallet)-[:FROM]->(t)
MERGE (t)-[:TO]->(toWallet)
WITH fromWallet, toWallet, t
SET fromWallet.balance = fromWallet.balance - $amount
SET toWallet.balance = toWallet.balance + $amount
SET t.status = 'completed'
RETURN t