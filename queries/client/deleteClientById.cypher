MATCH (client:Client {id: $id})
WITH client, properties(client) AS deleteClient
DETACH DELETE client
RETURN deleteClient