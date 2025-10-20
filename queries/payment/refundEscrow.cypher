MATCH (escrow:EscrowWallet {id: $escrowId, status: 'funded'})-[:HOLDS_FOR]->(job:Job {id: $jobId})
SET escrow.status = 'refunded',
    escrow.refundedAt = datetime($refundedAt),
    escrow.refundedBy = $refundedBy,
    escrow.refundReason = $reason
RETURN {
  id: escrow.id,
  workerId: escrow.workerId,
  clientId: escrow.clientId,
  amount: escrow.balance,
  jobId: escrow.jobId,
  status: escrow.status
} AS result