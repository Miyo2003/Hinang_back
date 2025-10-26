// Create user with all fields, allowing null values
CREATE (user:User {
    id: randomUUID(),
    email: toLower($email),
    username: $username,
    password: $password,
    role: COALESCE($role, 'client'),
    createdAt: datetime(),
    emailVerified: COALESCE($emailVerified, false),
    status: COALESCE($status, 'pending'),
    firstName: $firstName,
    middleName: $middleName,
    familyName: $familyName,
    phoneNumber: $phoneNumber,
    gender: $gender,
    age: $age,
    address: $address,
    latitude: $latitude,
    longitude: $longitude,
    placeId: $placeId
})

RETURN user

