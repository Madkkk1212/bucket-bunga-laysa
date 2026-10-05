(() => {
  document.body.dataset.sceneBridge = 'ready';
  const report = (message) => {
    const detail = String(message || 'Scene 3D gagal dimuat');
    document.body.dataset.sceneError = detail;
    if (window.parent !== window) {
      window.parent.postMessage({ source: 'bucket-garden-world', type: 'scene-error', message: detail }, location.origin);
    }
  };

  window.addEventListener('error', (event) => report(event.message));
  window.addEventListener('unhandledrejection', (event) => report(event.reason?.message || event.reason));
  fetch('/garden-world-script', { cache: 'no-store' })
    .then(async (response) => {
      document.body.dataset.scriptFetch = `${response.status} ${response.headers.get('content-type') || ''} ${response.headers.get('content-length') || ''}`.trim();
      return response.text();
    })
    .then((text) => { document.body.dataset.scriptLength = String(text.length); })
    .catch((error) => { document.body.dataset.scriptFetchError = error?.message || String(error); });
  import('/vendor/three.module.js')
    .then((three) => { document.body.dataset.threeImport = String(Object.keys(three).length); })
    .catch((error) => { document.body.dataset.threeImportError = error?.message || String(error); });
  import('/vendor/OrbitControls.js')
    .then((controls) => { document.body.dataset.controlsImport = String(Object.keys(controls).length); })
    .catch((error) => { document.body.dataset.controlsImportError = error?.message || String(error); });
  import('/garden-world-script')
    .then(() => { document.body.dataset.sceneModule = 'loaded'; })
    .catch((error) => report(error?.stack || error?.message || error));
})();
