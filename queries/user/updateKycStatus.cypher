MATCH (user:User {id: $userId})
SET user.kycStatus = $status,
    user.kycReviewedBy = $reviewerId,
    user.kycReviewedAt = datetime($reviewedAt),
    user.kycNotes = $notes
RETURN user