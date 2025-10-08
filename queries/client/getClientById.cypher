MATCH (client:Client {id: $id})
OPTIONAL MATCH (client)<-[:HAS_CLIENT]-(user:User)
RETURN client, user