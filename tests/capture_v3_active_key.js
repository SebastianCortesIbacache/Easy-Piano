const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const BASE_DIR = path.resolve(__dirname, '..');
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const exe = fs.existsSync(edgePath) ? edgePath : chromePath;

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
  let reqUrl = req.url.split('?')[0];
  if (reqUrl === '/') reqUrl = '/index.html';
  const filePath = path.join(BASE_DIR, reqUrl);

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    } else {
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
      res.end(content);
    }
  });
});

server.listen(8096, '127.0.0.1', async () => {
  const tempProfile = path.join(os.tmpdir(), 'v3_hint_profile_' + Date.now());
  const context = await chromium.launchPersistentContext(tempProfile, {
    headless: true,
    executablePath: exe,
    viewport: { width: 1280, height: 800 },
    args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--no-sandbox']
  });
  const page = await context.newPage();

  await page.goto('http://127.0.0.1:8096/index.html?v=' + Date.now());
  
  await page.waitForFunction(() => {
    const l = document.getElementById('loader');
    return !l || l.classList.contains('gone');
  }, { timeout: 10000 });

  await page.evaluate(() => {
    localStorage.setItem('pf_onboarding_done', 'true');
    const ob = document.getElementById('onboardingModal');
    if (ob) ob.hidden = true;
    startPractice(LEVELS[0]);
    skipIntro();
    const cd = document.getElementById('countdownOverlay');
    if (cd) cd.classList.remove('show');
    setHint(LEVELS[0].notes[0]); // Tecla activa
  });
  await page.waitForTimeout(600);

  // Capturar vista de práctica con tecla activa brillando en verde menta
  await page.screenshot({ path: path.join(BASE_DIR, 'screenshot_v3_active_hint.png'), fullPage: false });
  console.log('✓ Captura guardada: screenshot_v3_active_hint.png');

  await context.close();
  server.close();
  process.exit(0);
});
