/** Limits concurrent GROQ calls for v19 (GROQ TPM safety). */

const MAX_CONCURRENT = Number(process.env.V19_MAX_GROQ_CONCURRENT ?? 3);
let inFlight = 0;
const waitQueue: Array<() => void> = [];

export async function withV19GroqSlot<T>(fn: () => Promise<T>): Promise<T> {
  await acquire();
  try {
    return await fn();
  } finally {
    release();
  }
}

function acquire(): Promise<void> {
  if (inFlight < MAX_CONCURRENT) {
    inFlight += 1;
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    waitQueue.push(() => {
      inFlight += 1;
      resolve();
    });
  });
}

function release() {
  inFlight = Math.max(0, inFlight - 1);
  const next = waitQueue.shift();
  if (next) next();
}

export function v19ConcurrencyStats() {
  return { inFlight, maxConcurrent: MAX_CONCURRENT, queued: waitQueue.length };
}
