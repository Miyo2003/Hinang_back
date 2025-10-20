MATCH (w:Worker)<-[:ASSIGNED_TO]-(j:Job)
OPTIONAL MATCH (j)<-[:REVIEWS_JOB]-(r:Review)
WITH w, count(j) AS assignmentCount, avg(r.rating) AS averageRating
RETURN w.id AS workerId, assignmentCount, averageRating
ORDER BY assignmentCount DESC, averageRating DESC
LIMIT 10