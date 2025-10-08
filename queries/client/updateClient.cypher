MATCH (client:Client {id: $id})
SET client.clientType = $clientType,
    client.serviceRequired = $serviceRequired,
    client.budget = $budget,
    client.contactPerson = $contactPerson,
    client.contactPreference = $contactPreference
RETURN client