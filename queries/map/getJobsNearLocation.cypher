MATCH (job:Job)-[:LOCATED_AT]->(loc:Location)
WITH job, loc,
     point({latitude: toFloat(loc.latitude), longitude: toFloat(loc.longitude)}) AS jobPoint,
     point({latitude: toFloat($latitude), longitude: toFloat($longitude)}) AS userPoint
WHERE distance(jobPoint, userPoint) < $radius
RETURN job, loc, distance(jobPoint, userPoint) AS dist
ORDER BY dist ASC