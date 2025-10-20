// Create basic user with required fields
CREATE (user:User {
    id: randomUUID(),
    email: toLower($email),
    username: $username,
    password: $password,
    role: COALESCE($role, 'client'),
    createdAt: datetime(),
    emailVerified: false,
    status: COALESCE($status, 'pending')
})

// Add optional fields using FOREACH
FOREACH (_ IN CASE WHEN $firstName IS NOT NULL THEN [1] ELSE [] END |
    SET user.firstName = $firstName)
FOREACH (_ IN CASE WHEN $middleName IS NOT NULL THEN [1] ELSE [] END |
    SET user.middleName = $middleName)
FOREACH (_ IN CASE WHEN $familyName IS NOT NULL THEN [1] ELSE [] END |
    SET user.familyName = $familyName)
FOREACH (_ IN CASE WHEN $phoneNumber IS NOT NULL THEN [1] ELSE [] END |
    SET user.phoneNumber = $phoneNumber)
FOREACH (_ IN CASE WHEN $gender IS NOT NULL THEN [1] ELSE [] END |
    SET user.gender = $gender)
FOREACH (_ IN CASE WHEN $age IS NOT NULL THEN [1] ELSE [] END |
    SET user.age = $age)
FOREACH (_ IN CASE WHEN $address IS NOT NULL THEN [1] ELSE [] END |
    SET user.address = $address)

RETURN user

