MATCH (escrow:EscrowWallet {id: $escrowId, status: 'funded'})-[:HOLDS_FOR]->(job:Job {id: $jobId})
SET escrow.status = 'released',
    escrow.releasedAt = datetime($releasedAt),
    escrow.releasedBy = $releasedBy
RETURN {
  id: escrow.id,
  workerId: escrow.workerId,
  clientId: escrow.clientId,
  amount: escrow.balance,
  jobId: escrow.jobId,
  status: escrow.status
} AS result