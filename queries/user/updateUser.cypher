MATCH (user:User {id: $id})
SET user.firstName = $firstName,
    user.middleName = $middleName,
    user.familyName = $familyName,
    user.username = $username,
    user.email = $email,
    user.phoneNumber = $phoneNumber,
    user.gender = $gender,
    user.age = $age,
    user.address = $address,
    user.status = $status
RETURN user