MATCH (job:Job)
WHERE 
  (CASE 
    WHEN $jobType IS NOT NULL THEN job.jobType = $jobType 
    ELSE true 
  END)
  AND
  (CASE 
    WHEN $jobArea IS NOT NULL THEN job.jobArea = $jobArea 
    ELSE true 
  END)
RETURN count(job) as count