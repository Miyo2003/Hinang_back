CREATE (user:User {
    id: randomUUID(),
    firstName: $firstName,
    middleName: $middleName,
    familyName: $familyName,
    username: $username,
    email: $email,
    phoneNumber: $phoneNumber,
    gender: $gender,
    age: $age,
    address: $address,
    status: $status,
    password: $password,
    role: $role,
    createdAt: datetime()
})
RETURN user

