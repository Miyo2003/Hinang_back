MATCH (user:User {username: $username})
RETURN user
LIMIT 1
