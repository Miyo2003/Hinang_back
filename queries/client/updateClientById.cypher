MATCH (client:Client  {id: $id})
SET client += $updates
RETURN client