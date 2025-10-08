MATCH (job:Job {id: $id})
SET job.jobName = $jobName,
    job.jobDescription =$jobDescription,
    job.jobType = $jobType,
    job.JobDuration = $JobDuration,
    job.jobMedia = $jobMedia,
    job.jobArea = $jobArea

RETURN job