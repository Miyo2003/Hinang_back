MATCH (worker:Worker {id: $id})
SET worker.skills = $skills,
    worker.hourlyRate = $hourlyRate,
    worker.availability = $availability,
    worker.startDate = $startDate,
    worker.endDate = $endDate
RETURN worker