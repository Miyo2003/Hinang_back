MATCH (job: Job {id: $id})
FOREACH(ignore IN CASE WHEN $jobName IS NULL THEN [] ELSE [1] END |
    SET job.jobName = $jobName)

FOREACH(ignore IN CASE WHEN $jobDescription IS NULL THEN [] ELSE [1] END |
    SET job.jobDescription = $jobDescription)

FOREACH(ignore IN CASE WHEN $jobType IS NULL THEN [] ELSE [1] END |
    SET job.jobType = $jobType)

FOREACH(ignore IN CASE WHEN $jobMedia IS NULL THEN [] ELSE [1] END |
    SET job.jobMedia = $jobMedia)

FOREACH(ignore IN CASE WHEN $JobDuration IS NULL THEN [] ELSE [1] END |
    SET job.JobDuration = $JobDuration)

FOREACH(ignore IN CASE WHEN $jobArea IS NULL THEN [] ELSE [1] END |
    SET job.jobArea = $jobArea)