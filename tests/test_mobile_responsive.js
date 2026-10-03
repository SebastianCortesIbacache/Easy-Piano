const { chromium } = require('playwright');
const path = require('path');
const http = require('http');
const fs = require('fs');

// Simple static server for tests
function createServer() {
  const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.glb': 'model/gltf-binary',
    '.webmanifest': 'application/manifest+json'
  };

  const rootDir = path.resolve(__dirname, '..');
  const server = http.createServer((req, res) => {
    let reqUrl = req.url.split('?')[0];
    if (reqUrl === '/') reqUrl = '/index.html';
    const filePath = path.join(rootDir, reqUrl);

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
        return;
      }
      const ext = path.extname(filePath);
      const contentType = mimeTypes[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    });
  });

  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      resolve({ server, port });
    });
  });
}

(async () => {
  console.log('🚀 Iniciando pruebas de adaptabilidad multidispositivo...');
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const exe = fs.existsSync(edgePath) ? edgePath : chromePath;

  const { server, port } = await createServer();
  const url = `http://127.0.0.1:${port}/index.html`;

  const browser = await chromium.launch({
    headless: true,
    executablePath: exe,
    args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage']
  });

  const viewports = [
    { name: 'Smartphone Vertical (375x667)', width: 375, height: 667, isMobile: true, hasTouch: true },
    { name: 'Smartphone Moderno Vertical (390x844)', width: 390, height: 844, isMobile: true, hasTouch: true },
    { name: 'Smartphone Horizontal / Landscape (844x390)', width: 844, height: 390, isMobile: true, hasTouch: true },
    { name: 'Tablet Vertical (768x1024)', width: 768, height: 1024, isMobile: true, hasTouch: true },
    { name: 'Tablet Horizontal (1024x768)', width: 1024, height: 768, isMobile: true, hasTouch: true },
    { name: 'Desktop HD (1366x768)', width: 1366, height: 768, isMobile: false, hasTouch: false }
  ];

  let totalTests = 0;
  let passedTests = 0;

  for (const vp of viewports) {
    totalTests++;
    console.log(`\n📱 Probando dispositivo: ${vp.name}...`);
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      isMobile: vp.isMobile,
      hasTouch: vp.hasTouch
    });
    const page = await context.newPage();

    try {
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(600);

      // 1. Verificar desbordamiento horizontal global
      const overflow = await page.evaluate(() => {
        return {
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
          bodyScrollWidth: document.body.scrollWidth,
          hasGlobalOverflow: document.documentElement.scrollWidth > window.innerWidth + 2
        };
      });

      if (overflow.hasGlobalOverflow) {
        console.error(`❌ Fallo: Hay desbordamiento horizontal en ${vp.name}: scrollWidth=${overflow.scrollWidth} > innerWidth=${vp.width}`);
      } else {
        console.log(`  ✓ Sin desbordamiento horizontal (scrollWidth: ${overflow.scrollWidth}px <= ${vp.width}px)`);
      }

      // 2. Verificar que el teclado de piano está renderizado y accesible
      const pianoVisible = await page.evaluate(() => {
        const p = document.getElementById('piano');
        const pw = document.getElementById('pianoWrap');
        if (!p || !pw) return false;
        const rect = p.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      });

      if (!pianoVisible) {
        console.error(`❌ Fallo: El piano no es visible en ${vp.name}`);
      } else {
        console.log(`  ✓ Teclado de piano renderizado correctamente y con dimensiones válidas`);
      }

      // 3. Capturar screenshot representativo
      if (vp.name.includes('Smartphone Moderno Vertical')) {
        await page.screenshot({ path: path.join(__dirname, 'screenshot_phone_portrait.png') });
        console.log(`  📷 Captura guardada: screenshot_phone_portrait.png`);
      } else if (vp.name.includes('Smartphone Horizontal')) {
        await page.screenshot({ path: path.join(__dirname, 'screenshot_phone_landscape.png') });
        console.log(`  📷 Captura guardada: screenshot_phone_landscape.png`);
      }

      if (!overflow.hasGlobalOverflow && pianoVisible) {
        passedTests++;
      }
    } catch (err) {
      console.error(`❌ Error en viewport ${vp.name}:`, err);
    } finally {
      await context.close();
    }
  }

  await browser.close();
  server.close();

  console.log(`\n========================================`);
  console.log(`📊 RESULTADO: ${passedTests}/${totalTests} pruebas responsivas pasadas con 100% de éxito.`);
  console.log(`========================================\n`);

  if (passedTests !== totalTests) {
    process.exit(1);
  }
})();
