MATCH (p:Payment {id: $paymentId, status: 'completed'})<-[:TRACKS_PAYMENT]-(job:Job {id: $jobId})
CREATE (escrow:EscrowWallet {
  id: randomUUID(),
  balance: p.amount,
  currency: p.currency,
  jobId: $jobId,
  status: 'funded',
  createdAt: datetime($createdAt),
  clientId: $clientId,
  workerId: p.workerId
})
MERGE (escrow)-[:HOLDS_FOR]->(job)
RETURN escrow