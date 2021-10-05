const workerCreater = function(cmdObj, callback) {
  const prevHash = window.localStorage.getItem('version_hash');
  let worker = new Worker(`async-web-worker.js?${prevHash}`);

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
