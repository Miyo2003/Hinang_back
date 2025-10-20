MATCH (:Job {id: $jobId})-[:INVITED_WORKER]->(invite:AssignmentInvite {id: $inviteId})-[:INVITES]->(worker:Worker)
WHERE invite.status = 'pending'
SET invite.status = 'revoked',
    invite.revokedAt = datetime($revokedAt),
    invite.revokedBy = $revokedBy
RETURN invite, worker