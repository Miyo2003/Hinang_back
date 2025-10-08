MATCH (r:Review {id: $id})
WITH r, properties(r) AS deletedReview
DETACH DELETE r
RETURN deletedReview
