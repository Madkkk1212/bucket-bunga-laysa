const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const edgePath = fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')
  ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  : 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const userDataDir = path.join(__dirname, 'edge_dev_profile_after');

async function launchBrowser() {
  const proc = spawn(edgePath, [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--remote-debugging-port=9223',
    `--user-data-dir=${userDataDir}`,
    'about:blank'
  ], { stdio: 'ignore' });

  let wsUrl = null;
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 200));
    try {
      const res = await fetch('http://127.0.0.1:9223/json/version');
      const data = await res.json();
      if (data.webSocketDebuggerUrl) {
        wsUrl = data.webSocketDebuggerUrl;
        break;
      }
    } catch {}
  }
  if (!wsUrl) {
    proc.kill();
    throw new Error('CDP connect failed');
  }
  return { proc, wsUrl };
}

async function captureState({ draftId, width, height, opened, template, openDrawer, outputPath }) {
  const url = `http://localhost:3000/preview/${draftId}`;
  const targetRes = await fetch('http://127.0.0.1:9223/json/new?' + encodeURIComponent(url), { method: 'PUT' });
  const target = await targetRes.json();
  const ws = new WebSocket(target.webSocketDebuggerUrl);

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

  await send('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: 2,
    mobile: width < 768,
  });

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Page.navigate', { url });

  // Wait for page ready
  for (let i = 0; i < 50; i++) {
    const evalRes = await send('Runtime.evaluate', {
      expression: 'Boolean(document.querySelector("header") && !document.querySelector(".animate-spin"))'
    });
    if (evalRes?.result?.value) break;
    await new Promise(r => setTimeout(r, 200));
  }
  await new Promise(r => setTimeout(r, 800));

  // If drawer requested or template switch
  if (openDrawer || (template && template !== 'klasik')) {
    await send('Runtime.evaluate', {
      expression: `
        const editBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Kustomisasi') || b.textContent.includes('Edit'));
        if (editBtn) editBtn.click();
      `
    });
    await new Promise(r => setTimeout(r, 600));

    if (template && template !== 'klasik') {
      await send('Runtime.evaluate', {
        expression: `
          const tmplBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Taman Mekar'));
          if (tmplBtn) tmplBtn.click();
        `
      });
      await new Promise(r => setTimeout(r, 600));
      if (!openDrawer) {
        // close drawer
        await send('Runtime.evaluate', {
          expression: `
            const closeBtn = document.querySelector('button[aria-label="Tutup Panel"]') || Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Tutup'));
            if (closeBtn) closeBtn.click();
          `
        });
        await new Promise(r => setTimeout(r, 400));
      }
    }
  }

  if (opened) {
    await send('Runtime.evaluate', {
      expression: `
        const openStageBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Setelah Dibuka') || b.textContent.includes('Setelah Buka'));
        if (openStageBtn) openStageBtn.click();
        else {
          const openGiftBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Buka Kado & Lihat Buketmu'));
          if (openGiftBtn) openGiftBtn.click();
        }
      `
    });
    await new Promise(r => setTimeout(r, 1200));
  }

  const screenshot = await send('Page.captureScreenshot', { format: 'png' });
  const buffer = Buffer.from(screenshot.data, 'base64');
  fs.writeFileSync(outputPath, buffer);
  console.log(`Saved: ${outputPath}`);

  ws.close();
  await fetch(`http://127.0.0.1:9223/json/close/${target.id}`).catch(() => {});
}

async function run() {
  const { proc } = await launchBrowser();
  try {
    const draftRes = await fetch('http://localhost:3000/api/gifts/preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        senderName: 'Andi Pratama',
        recipientName: 'Clarissa Putri',
        message: 'Untukmu yang selalu membuat hariku penuh warna. Semoga buket bunga digital ini membawa senyuman di wajah manismu.',
        config: { templateId: 'klasik', effectId: 'petals', giftObjectId: 'envelope' },
        photos: []
      })
    });
    const draftJson = await draftRes.json();
    const draftId = draftJson.draftId;
    console.log('Draft ID:', draftId);

    const outDir = path.join(__dirname, 'proofs_after');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    // 1. Klasik Unopened (390, 768, 1280)
    await captureState({ draftId, width: 390, height: 844, opened: false, template: 'klasik', openDrawer: false, outputPath: path.join(outDir, 'klasik_unopened_390.png') });
    await captureState({ draftId, width: 768, height: 1024, opened: false, template: 'klasik', openDrawer: false, outputPath: path.join(outDir, 'klasik_unopened_768.png') });
    await captureState({ draftId, width: 1280, height: 800, opened: false, template: 'klasik', openDrawer: false, outputPath: path.join(outDir, 'klasik_unopened_1280.png') });

    // 2. Klasik Opened (390, 768, 1280)
    await captureState({ draftId, width: 390, height: 844, opened: true, template: 'klasik', openDrawer: false, outputPath: path.join(outDir, 'klasik_opened_390.png') });
    await captureState({ draftId, width: 768, height: 1024, opened: true, template: 'klasik', openDrawer: false, outputPath: path.join(outDir, 'klasik_opened_768.png') });
    await captureState({ draftId, width: 1280, height: 800, opened: true, template: 'klasik', openDrawer: false, outputPath: path.join(outDir, 'klasik_opened_1280.png') });

    // 3. Taman Mekar Unopened & Opened
    await captureState({ draftId, width: 390, height: 844, opened: false, template: 'taman-mekar', openDrawer: false, outputPath: path.join(outDir, 'taman_unopened_390.png') });
    await captureState({ draftId, width: 1280, height: 800, opened: true, template: 'taman-mekar', openDrawer: false, outputPath: path.join(outDir, 'taman_opened_1280.png') });

    // 4. Drawer open on mobile (390) and desktop (1280)
    await captureState({ draftId, width: 390, height: 844, opened: false, template: 'klasik', openDrawer: true, outputPath: path.join(outDir, 'drawer_mobile_390.png') });
    await captureState({ draftId, width: 1280, height: 800, opened: false, template: 'klasik', openDrawer: true, outputPath: path.join(outDir, 'drawer_desktop_1280.png') });

    console.log('All after proofs captured successfully!');
  } finally {
    proc.kill();
  }
}

run().catch(console.error);
