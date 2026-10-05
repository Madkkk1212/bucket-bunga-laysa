const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const edgePath = fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')
  ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  : 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const userDataDir = path.join(__dirname, 'edge_dev_profile');

async function capture({ url, width, height, outputPath, waitMs = 2000 }) {
  console.log(`[Capture] Launching browser for ${width}px...`);
  const proc = spawn(edgePath, [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--remote-debugging-port=9222',
    `--user-data-dir=${userDataDir}`,
    'about:blank'
  ], { stdio: 'ignore' });

  // Wait for debug port
  let wsUrl = null;
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 200));
    try {
      const res = await fetch('http://127.0.0.1:9222/json/version');
      const data = await res.json();
      if (data.webSocketDebuggerUrl) {
        wsUrl = data.webSocketDebuggerUrl;
        break;
      }
    } catch {}
  }

  if (!wsUrl) {
    proc.kill();
    throw new Error('Failed to connect to browser CDP port');
  }

  // Create new target/tab
  const targetRes = await fetch('http://127.0.0.1:9222/json/new?' + encodeURIComponent(url), { method: 'PUT' });
  const target = await targetRes.json();
  const pageWsUrl = target.webSocketDebuggerUrl;

  const ws = new WebSocket(pageWsUrl);
  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });

  let id = 1;
  const send = (method, params = {}) => {
    const msgId = id++;
    return new Promise((resolve, reject) => {
      const handler = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.id === msgId) {
          ws.removeEventListener('message', handler);
          if (msg.error) reject(msg.error);
          else resolve(msg.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  };

  // Set device metrics
  await send('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: 2,
    mobile: width < 768,
  });

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Console.enable');

  ws.addEventListener('message', (event) => {
    const msg = JSON.parse(event.data);
    if (msg.method === 'Runtime.exceptionThrown') {
      console.error('[BROWSER EXCEPTION]', msg.params.exceptionDetails);
    }
    if (msg.method === 'Console.messageAdded') {
      console.log('[BROWSER CONSOLE]', msg.params.message.text);
    }
  });

  await send('Page.navigate', { url });

  console.log(`[Capture] Waiting for DOM readiness...`);
  for (let i = 0; i < 50; i++) {
    const evalRes = await send('Runtime.evaluate', {
      expression: 'Boolean(document.querySelector("header") || document.querySelector(".gift-page-root") || document.querySelector("h1"))'
    });
    if (evalRes?.result?.value) {
      console.log('[Capture] Element ready at check ' + i);
      break;
    }
    await new Promise(r => setTimeout(r, 200));
  }
  await new Promise(r => setTimeout(r, 1000));

  const screenshot = await send('Page.captureScreenshot', { format: 'png' });
  const buffer = Buffer.from(screenshot.data, 'base64');
  fs.writeFileSync(outputPath, buffer);
  console.log(`[Capture] Saved to ${outputPath} (${buffer.length} bytes)`);

  ws.close();
  proc.kill();
}

async function test() {
  const out = path.join(__dirname, 'test_sample.png');
  await capture({
    url: 'http://localhost:3000/preview/draft_1790871357913_01c7vy3',
    width: 1280,
    height: 800,
    outputPath: out,
    waitMs: 2500,
  });
}

test().catch(console.error);
