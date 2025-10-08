// Create a new attachment
MATCH (owner {id: $ownerId})
WHERE owner:User OR owner:Job OR owner:Post
CREATE (a:Attachment {
    id: randomUUID(),
    filename: $filename,
    fileType: $fileType,
    fileSize: $fileSize,
    url: $url,
    uploadedAt: datetime()
})
MERGE (owner)-[:HAS_ATTACHMENT]->(a)
RETURN a