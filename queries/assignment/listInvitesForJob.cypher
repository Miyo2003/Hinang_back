MATCH (:Job {id: $jobId})-[:INVITED_WORKER]->(invite:AssignmentInvite)
RETURN invite
ORDER BY invite.invitedAt DESC