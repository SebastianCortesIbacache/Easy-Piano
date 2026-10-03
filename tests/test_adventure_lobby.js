const { chromium } = require('playwright');
const path = require('path');
const http = require('http');
const fs = require('fs');

function createServer(port = 8097) {
  const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
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
      res.writeHead(200, { 'Content-Type': contentType, 'Cache-Control': 'no-cache, no-store' });
      res.end(data);
    });
  });

  return new Promise((resolve) => {
    server.listen(port, '127.0.0.1', () => {
      resolve(server);
    });
  });
}

(async () => {
  console.log('\n================================================================');
  console.log('🏰 [TEST SUITE] Lobby de Aventura y Gamificación 3.0');
  console.log('================================================================\n');

  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const exe = fs.existsSync(edgePath) ? edgePath : chromePath;

  const server = await createServer(8097);
  const browser = await chromium.launch({
    headless: true,
    executablePath: exe,
    args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage']
  });

  const page = await browser.newPage();
  const testsPassed = [];
  const testsFailed = [];

  try {
    await page.goto('http://127.0.0.1:8097/index.html?test=' + Date.now(), { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);

    // 1. Selector de Mundos en Lobby (1 al 9)
    console.log('🧪 TEST 1: Barra Interactiva de Mundos Musicales en #pathView...');
    const worldCardsCheck = await page.evaluate(() => {
      const bar = document.getElementById('adventureWorldsBarCard');
      const cards = document.querySelectorAll('.worldCardBtn');
      const track = document.getElementById('worldsScrollTrack');
      const btnAll = document.getElementById('btnFilterAllWorlds');
      
      const names = Array.from(cards).map(c => c.querySelector('.wcbWorldName')?.textContent || '');
      const starsBadges = Array.from(cards).map(c => c.querySelector('.wcbStarsBadge')?.textContent || '');

      return {
        hasBar: !!bar,
        cardsCount: cards.length,
        hasTrack: !!track,
        hasBtnAll: !!btnAll,
        names,
        starsBadges
      };
    });

    if (worldCardsCheck.hasBar && worldCardsCheck.cardsCount === 9 && worldCardsCheck.names[0].includes('Ritmo y Do-Re-Mi') && worldCardsCheck.names[2].includes('Clave de Sol') && worldCardsCheck.names[4].includes('Clave de Fa')) {
      testsPassed.push(`Test 1: Barra de Mundos Musicales presente con 9 tarjetas temáticas (Mundo 1: ${worldCardsCheck.names[0]}, Mundo 3: ${worldCardsCheck.names[2]}, Mundo 5: ${worldCardsCheck.names[4]})`);
      console.log('  ✅ ' + testsPassed[testsPassed.length - 1]);
    } else {
      testsFailed.push(`Test 1: Error en Barra de Mundos (Tarjetas: ${worldCardsCheck.cardsCount})`);
    }

    // 2. Indicadores de estrellas por mundo y progresión de niveles (44 niveles)
    console.log('🧪 TEST 2: Estrellas acumuladas por mundo y 44 niveles...');
    const levelsCheck = await page.evaluate(() => {
      const totalLevels = typeof LEVELS !== 'undefined' ? LEVELS.length : 0;
      const totalStages = typeof STAGES !== 'undefined' ? STAGES.length : 0;
      
      // Simular progreso en mundo 1 (3 estrellas en nivel 1 y 2)
      storeSet('pf_path', JSON.stringify({ 1: 3, 2: 3 }));
      renderPath();

      const world1Stars = document.querySelector('#advWorldCard-1 .wcbStarsBadge')?.textContent || '';
      const world2Stars = document.querySelector('#advWorldCard-2 .wcbStarsBadge')?.textContent || '';
      const heroNextText = document.getElementById('heroNextLevelTxt')?.textContent || '';
      const heroStarsText = document.getElementById('heroStarsVal')?.textContent || '';

      return { totalLevels, totalStages, world1Stars, world2Stars, heroNextText, heroStarsText };
    });

    if (levelsCheck.totalLevels === 44 && levelsCheck.totalStages === 9 && levelsCheck.world1Stars.includes('6/6') && levelsCheck.heroNextText.includes('Nivel 3')) {
      testsPassed.push(`Test 2: Sistema de 44 niveles y 9 etapas renderizado con estrellas acumuladas (Mundo 1: ${levelsCheck.world1Stars}, Hero detecta: ${levelsCheck.heroNextText})`);
      console.log('  ✅ ' + testsPassed[testsPassed.length - 1]);
    } else {
      testsFailed.push(`Test 2: Falló validación de estrellas/niveles: ${JSON.stringify(levelsCheck)}`);
    }

    // 3. Botón 'CONTINUAR AVENTURA' (#heroContinueBtn) detección exacta y sonido
    console.log('🧪 TEST 3: Botón CONTINUAR AVENTURA detecta nivel exacto con feedback sonoro...');
    const continueBtnCheck = await page.evaluate(() => {
      let soundPlayed = null;
      window.playUiSound = function(s){ soundPlayed = s; };

      const heroBtn = document.getElementById('heroContinueBtn');
      if (heroBtn) heroBtn.click();

      const inPracticeNow = document.body.classList.contains('in-practice');
      const practiceLevelId = practice.level ? practice.level.id : null;

      // Volver a salir
      exitPractice();

      return { soundPlayed, inPracticeNow, practiceLevelId };
    });

    if (continueBtnCheck.soundPlayed === 'click' && continueBtnCheck.practiceLevelId === 3) {
      testsPassed.push(`Test 3: Botón CONTINUAR AVENTURA lanzó automáticamente Nivel 3 con feedback sonoro ('${continueBtnCheck.soundPlayed}')`);
      console.log('  ✅ ' + testsPassed[testsPassed.length - 1]);
    } else {
      testsFailed.push(`Test 3: Error en CONTINUAR AVENTURA (Sound: ${continueBtnCheck.soundPlayed}, Level: ${continueBtnCheck.practiceLevelId})`);
    }

    // 4. Filtrado y salto por mundo interactivo
    console.log('🧪 TEST 4: Salto y filtrado interactivo entre mundos...');
    const filterCheck = await page.evaluate(() => {
      // Click en Mundo 2
      const card2 = document.getElementById('advWorldCard-2');
      if (card2) card2.click();

      const stage2Container = document.getElementById('mapStage-2');
      const isStage2Open = stage2Container && stage2Container.classList.contains('open');
      const isStage1Filtered = document.getElementById('mapStage-1')?.classList.contains('stage-filtered-out');
      const hasBanner = !!document.querySelector('.lobbyFilterActiveBanner');

      // Click en 'Ver todos los mundos'
      const resetBtn = document.getElementById('btnFilterAllWorlds');
      if (resetBtn) resetBtn.click();
      const isStage1VisibleAgain = !document.getElementById('mapStage-1')?.classList.contains('stage-filtered-out');

      // Limpiar progreso de prueba
      storeSet('pf_path', '{}');
      storeSet('pf_last', '0');
      selectedLobbyStageFilter = 'all';
      renderPath();

      return { isStage2Open, isStage1Filtered, hasBanner, isStage1VisibleAgain };
    });

    if (filterCheck.isStage2Open && filterCheck.isStage1Filtered && filterCheck.hasBanner && filterCheck.isStage1VisibleAgain) {
      testsPassed.push(`Test 4: Filtrado y salto interactivo funcionando (Abre Mundo 2, aísla con banner, y 'Ver Todos' restaura los 9 mundos)`);
      console.log('  ✅ ' + testsPassed[testsPassed.length - 1]);
    } else {
      testsFailed.push(`Test 4: Error en filtrado de mundos: ${JSON.stringify(filterCheck)}`);
    }

  } catch (err) {
    console.error('❌ Excepción durante las pruebas:', err);
    testsFailed.push('Excepción: ' + err.message);
  } finally {
    await browser.close();
    server.close();
  }

  console.log('\n================================================================');
  console.log(`📊 RESULTADOS LOBBY DE AVENTURA: ${testsPassed.length} pasadas, ${testsFailed.length} falladas`);
  console.log('================================================================\n');

  if (testsFailed.length > 0) {
    process.exit(1);
  }
})();
