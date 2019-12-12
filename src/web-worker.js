const workerCreater = function(cmdObj, callback) {
  const worker = new Worker('async-web-worker.js');

  worker.addEventListener(
    'message',
    e => {
      if (typeof callback === 'function') {
        callback(e.data);
      }
      worker.terminate();
    },
    false,
  );

  worker.postMessage(cmdObj);
};

export default workerCreater;
