const http = require('http');

const routes = [
  '/303',
  '/asdfgh',
  '/produk/abc',
  '/404',
  '/b/idsalah',
  '/pagenotfound',
  '/',
  '/minigames',
  '/tutorial',
];

async function checkRoute(path) {
  return new Promise((resolve) => {
    const req = http.request(
      {
        hostname: 'localhost',
        port: 3000,
        path: path,
        method: 'GET',
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => {
          body += chunk;
        });
        res.on('end', () => {
          resolve({
            path,
            status: res.statusCode,
            location: res.headers.location || null,
            isNotFoundPage: body.includes('Kelopak Ini Hilang Arah') || body.includes('pagenotfound'),
            bodySnippet: body.slice(0, 150).replace(/\s+/g, ' '),
          });
        });
      }
    );
    req.on('error', (err) => {
      resolve({ path, error: err.message });
    });
    req.end();
  });
}

async function run() {
  console.log('Testing routes...');
  for (const r of routes) {
    const result = await checkRoute(r);
    console.log(JSON.stringify(result));
  }
}

run();
