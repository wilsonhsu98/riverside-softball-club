const workerCreater = function(cmdObj, callback) {
  let worker = new Worker('async-web-worker.js');

  worker.addEventListener(
    'message',
    e => {
      if (typeof callback === 'function') {
        callback(e.data);
      }
      worker.terminate();
      worker = null;
    },
    false,
  );

  worker.postMessage(cmdObj);
};

export default workerCreater;
