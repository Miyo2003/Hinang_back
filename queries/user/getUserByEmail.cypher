MATCH (user:User)
WHERE toLower(user.email) = $email
RETURN user
LIMIT 1