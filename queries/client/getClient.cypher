MATCH (client:Client)
WITH client
ORDER BY 
  CASE $sortBy 
    WHEN 'clientType' THEN client.clientType 
    WHEN 'budget' THEN toString(client.budget)
    ELSE client.createdAt
  END
  CASE $order WHEN 'desc' THEN DESC ELSE ASC END
SKIP $skip
LIMIT $limit
RETURN client