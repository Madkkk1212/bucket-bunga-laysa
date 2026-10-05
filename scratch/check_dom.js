const { spawn } = require('child_process');
const path = require('path');
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const userDataDir = path.join(__dirname, 'edge_inspect');

async function check() {
  const proc = spawn(edgePath, ['--headless=new', '--remote-debugging-port=9225', '--user-data-dir=' + userDataDir, 'about:blank'], { stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 1500));
  const target = await fetch('http://127.0.0.1:9225/json/new?http://localhost:3000/preview/draft_1790874739545_j6imqk2', { method: 'PUT' }).then(r => r.json());
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);
  let id = 1;
  const send = (m, p = {}) => new Promise((resolve) => {
    const mid = id++;
    const h = (e) => {
      const d = JSON.parse(e.data);
      if (d.id === mid) { ws.removeEventListener('message', h); resolve(d.result); }
    };
    ws.addEventListener('message', h);
    ws.send(JSON.stringify({ id: mid, method: m, params: p }));
  });

  await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 800, deviceScaleFactor: 2, mobile: false });
  await send('Page.enable');
  await send('Runtime.enable');
  await new Promise(r => setTimeout(r, 2000));

  const res = await send('Runtime.evaluate', {
    expression: `(() => {
      const allButtons = Array.from(document.querySelectorAll('button')).map(b => b.textContent.trim());
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Buka Kado'));
      const rect = (el) => {
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { top: r.top, bottom: r.bottom, left: r.left, width: r.width, height: r.height };
      };
      const main = document.querySelector('main');
      const whiteCard = Array.from(document.querySelectorAll('div')).find(d => d.textContent.includes('KEJUTAN BUKET DIGITAL') && d.className.includes('rounded'));
      return JSON.stringify({
        allButtons,
        hasOpenBtn: !!btn,
        btnRect: rect(btn),
        whiteCardRect: rect(whiteCard),
        mainRect: rect(main),
        windowHeight: window.innerHeight
      });
    })()`
  });
  console.log('DOM INFO:', res?.result?.value);
  ws.close();
  proc.kill();
}
check().catch(console.error);
