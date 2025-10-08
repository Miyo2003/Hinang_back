MATCH (user:User {id: $id})
WITH user, properties(user) AS deleteUser
DETACH DELETE user
RETURN deleteUser