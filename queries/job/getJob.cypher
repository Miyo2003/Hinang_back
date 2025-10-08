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
WITH job
ORDER BY 
  CASE WHEN $order = 'asc' THEN
    CASE 
      WHEN $sortBy = 'jobName' THEN job.jobName
      WHEN $sortBy = 'jobType' THEN job.jobType
      WHEN $sortBy = 'jobArea' THEN job.jobArea
      ELSE job.createdAt
    END
  END ASC,
  CASE WHEN $order = 'desc' OR $order IS NULL THEN
    CASE 
      WHEN $sortBy = 'jobName' THEN job.jobName
      WHEN $sortBy = 'jobType' THEN job.jobType
      WHEN $sortBy = 'jobArea' THEN job.jobArea
      ELSE job.createdAt
    END
  END DESC
SKIP $skip
LIMIT $limit
RETURN job