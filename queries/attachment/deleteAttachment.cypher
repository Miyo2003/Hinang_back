// Delete an attachment
MATCH (a:Attachment {id: $attachmentId})
OPTIONAL MATCH (a)<-[r:HAS_ATTACHMENT]-()
DELETE r, a