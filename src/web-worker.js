let worker;
let id = 0;
const callbacks = new Map();

function getWorker() {
  if (!worker) {
    const prevHash = window.localStorage.getItem('version_hash');
    worker = new Worker(`async-web-worker.js?${prevHash}`);

    worker.onmessage = e => {
      const { id, result } = e.data;
      const cb = callbacks.get(id);
      if (cb) {
        cb(result);
        callbacks.delete(id);
      }
    };

    worker.onerror = e => {
      console.error('worker error', e);
    };
  }
  return worker;
}

export function callWorker(payload) {
  return new Promise(resolve => {
    const worker = getWorker();
    const currentId = id++;

    callbacks.set(currentId, resolve);

    worker.postMessage({
      id: currentId,
      ...payload,
    });
  });
}
