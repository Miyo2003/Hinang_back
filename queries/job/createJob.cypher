CREATE (job:Job {
    id: $randomUUID,
    jobName: $jobName,
    jobDescription: $jobDescription,
    jobMedia: $jobMedia,
    JobDuration: $JobDuration,
    jobType: $jobType,
    jobArea: $jobArea
})
RETURN job