export function createJobQueue() {
  const jobs = [];
  return {
    enqueue(type, payload = {}, options = {}) {
      const job = {
        id: `job_${Date.now()}_${jobs.length}`,
        type,
        payload,
        priority: options.priority || 0,
        attempts: 0,
        status: 'queued',
        createdAt: new Date().toISOString(),
      };
      jobs.push(job);
      jobs.sort((a, b) => b.priority - a.priority);
      return job;
    },
    next() {
      const job = jobs.find(item => item.status === 'queued');
      if (!job) return null;
      job.status = 'running';
      job.attempts += 1;
      return job;
    },
    complete(id, result) {
      const job = jobs.find(item => item.id === id);
      if (!job) throw new Error('job not found');
      job.status = 'completed';
      job.result = result;
      return job;
    },
    fail(id, error) {
      const job = jobs.find(item => item.id === id);
      if (!job) throw new Error('job not found');
      job.status = 'failed';
      job.error = String(error);
      return job;
    },
    list() {
      return structuredClone(jobs);
    },
  };
}
