MATCH (job:Job {id: $jobId})<-[:OWNS]-(client:User)
MATCH (worker:Worker {id: $workerId})<-[:OWNED_BY]-(workerUser:User)
CREATE (invite:AssignmentInvite {
  id: randomUUID(),
  status: 'pending',
  invitedAt: datetime($invitedAt),
  invitedBy: $invitedBy,
  expiresAt: CASE WHEN $expiresAt IS NULL THEN NULL ELSE datetime($expiresAt) END
})
MERGE (job)-[:INVITED_WORKER]->(invite)
MERGE (invite)-[:INVITES]->(worker)
RETURN invite