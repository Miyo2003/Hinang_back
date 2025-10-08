MATCH (user:User {id: $id})
SET user += $updates
RETURN user




// MATCH (user:User {id: $id})
// FOREACH(ignore IN CASE WHEN $firstName IS NULL THEN [] ELSE [1] END |
//     SET user.firstName = $firstName)
// FOREACH(ignore IN CASE WHEN $middleName IS NULL THEN [] ELSE [1] END |
//     SET user.middleName = $middleName)
// FOREACH(ignore IN CASE WHEN $familyName IS NULL THEN [] ELSE [1] END |
//     SET user.familyName = $familyName)
// FOREACH(ignore IN CASE WHEN $username IS NULL THEN [] ELSE [1] END |
//     SET user.username = $username)
// FOREACH(ignore IN CASE WHEN $email IS NULL THEN [] ELSE [1] END |
//     SET user.email = $email)
// FOREACH(ignore IN CASE WHEN $phoneNumber IS NULL THEN [] ELSE [1] END |
//     SET user.phoneNumber = $phoneNumber)
// FOREACH(ignore IN CASE WHEN $gender IS NULL THEN [] ELSE [1] END |
//     SET user.gender = $gender)
// FOREACH(ignore IN CASE WHEN $age IS NULL THEN [] ELSE [1] END |
//     SET user.age = $age)
// FOREACH(ignore IN CASE WHEN $address IS NULL THEN [] ELSE [1] END |
//     SET user.address = $address)
// RETURN user
