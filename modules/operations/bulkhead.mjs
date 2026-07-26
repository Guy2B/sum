export function createBulkhead({ concurrency = 2, queueLimit = 20 } = {}) {
  let active = 0;
  const queue = [];

  function drain() {
    while (active < concurrency && queue.length) {
      const job = queue.shift();
      active += 1;
      Promise.resolve()
        .then(job.task)
        .then(job.resolve, job.reject)
        .finally(() => {
          active -= 1;
          drain();
        });
    }
  }

  return {
    execute(task) {
      if (queue.length >= queueLimit) return Promise.reject(new Error('bulkhead queue full'));
      return new Promise((resolve, reject) => {
        queue.push({ task, resolve, reject });
        drain();
      });
    },
    status() {
      return { active, queued: queue.length, concurrency, queueLimit };
    },
  };
}
