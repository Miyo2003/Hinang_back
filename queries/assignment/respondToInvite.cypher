MATCH (job:Job {id: $jobId})<-[:OWNS]-(client:User)
MATCH (job)-[:INVITED_WORKER]->(invite:AssignmentInvite {id: $inviteId})
MATCH (invite)-[:INVITES]->(worker:Worker)<-[:OWNED_BY]-(workerUser:User {id: $workerId})
WHERE invite.status = 'pending'
  AND (invite.expiresAt IS NULL OR invite.expiresAt > datetime())
WITH job, client, invite, worker
SET invite.status = $response,
    invite.respondedAt = datetime($respondedAt)
WITH job, client, invite, worker
CALL apoc.do.when(
  $response = 'accepted',
  '
    MERGE (job)<-[:ASSIGNED_TO]-(worker)
    SET worker.status = "assigned"
    RETURN worker AS assignmentWorker
  ',
  '
    RETURN worker AS assignmentWorker
  ',
  {job: job, worker: worker}
) YIELD value
RETURN invite, value.assignmentWorker AS assignment, client