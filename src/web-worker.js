let worker;
let idCounter = 0;
const callbacks = new Map();

function getWorker() {
  if (!worker) {
    const prevHash = window.localStorage.getItem('version_hash');
    worker = new Worker(`async-web-worker.js?${prevHash}`);

    worker.onmessage = ({ data: { id, result, error } }) => {
      const cb = callbacks.get(id);
      if (!cb) return;
      callbacks.delete(id);
      error ? cb.reject(new Error(error)) : cb.resolve(result);
    };

    worker.onerror = e => {
      console.error('worker error', e);
      // reject all pending callbacks to avoid hung promises
      for (const [id, cb] of callbacks) {
        cb.reject(new Error('Worker encountered an error'));
        callbacks.delete(id);
      }
      worker = null;
      console.warn(
        `[worker] crashed, ${callbacks.size} callbacks cleared, idCounter at ${idCounter}`,
      );
    };
  }
  return worker;
}

function callWorker(payload) {
  return new Promise((resolve, reject) => {
    const currentId = idCounter++;
    callbacks.set(currentId, { resolve, reject });
    getWorker().postMessage({ id: currentId, ...payload });
  });
}

let running = false;
const queue = [];

async function runNext() {
  if (running || !queue.length) return;

  running = true;
  const { payload, resolve, reject } = queue.shift();

  try {
    const result = await callWorker(payload);
    resolve(result);
  } catch (err) {
    reject(err);
  } finally {
    running = false;
    runNext();
  }
}

export function callWorkerQueued(payload) {
  return new Promise((resolve, reject) => {
    queue.push({ payload, resolve, reject });
    runNext();
  });
}
