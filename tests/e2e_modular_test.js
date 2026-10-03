const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_DIR = path.resolve(__dirname, '..');
const TEMP_DIR = path.join(BASE_DIR, '.temp_playwright');
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

async function runTests() {
  console.log('\n========================================================');
  console.log('🚀 [Agente Tester QA] Test Suite: Modo Niño Condensado & Rainbow Songs');
  console.log('Target URL: http://127.0.0.1:8099/index.html?v=8.0');
  console.log('========================================================\n');

  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const exe = fs.existsSync(edgePath) ? edgePath : chromePath;

  const testsPassed = [];
  const testsFailed = [];
  const consoleErrors = [];

  let context;
  try {
    const profileDir = path.join(TEMP_DIR, 'browser_profile');
    if (!fs.existsSync(profileDir)) fs.mkdirSync(profileDir, { recursive: true });

    context = await chromium.launchPersistentContext(profileDir, {
      headless: true,
      executablePath: exe,
      viewport: { width: 1280, height: 800 },
      args: [
        '--no-sandbox',
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--disable-software-rasterizer'
      ]
    });

    const page = context.pages().length > 0 ? context.pages()[0] : await context.newPage();

    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error('❌ Console Error:', msg.text());
        consoleErrors.push(msg.text());
      }
    });

    page.on('pageerror', err => {
      console.error('❌ Unhandled Page Error:', err.message);
      consoleErrors.push(err.message);
    });

    // 1. Cargar Página Principal
    console.log('🧪 TEST 1: Carga limpia de la aplicación...');
    await page.goto('http://127.0.0.1:8099/index.html?v=8.0', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(800);

    const title = await page.title();
    if (title.includes('PianoFácil PRO')) {
      testsPassed.push(`Test 1: Página cargada correctamente (${title})`);
      console.log('  ✅ ' + testsPassed[testsPassed.length - 1]);
    } else {
      testsFailed.push('Test 1: Título incorrecto: ' + title);
    }

    // 2. Verificar Modo Niño por Defecto y Selector de 9 Mundos
    console.log('🧪 TEST 2: Validación de Modo Niño condensado y 9 Mundos...');
    const kidWorldCheck = await page.evaluate(() => {
      const isKid = document.body.classList.contains('kid-mode');
      const box = document.getElementById('kidPathMini');
      const isVisible = box && !box.hidden;
      const worldButtons = box ? box.querySelectorAll('.kid-world-btn').length : 0;
      const currentWorldPills = box ? box.querySelectorAll('.kid-pill').length : 0;
      const heroBtn = box ? box.querySelector('.kid-hero-play-btn') : null;
      return {
        isKid,
        isVisible,
        worldButtons,
        currentWorldPills,
        hasHeroBtn: !!heroBtn
      };
    });

    if (kidWorldCheck.isKid && kidWorldCheck.isVisible && kidWorldCheck.worldButtons === 9 && kidWorldCheck.currentWorldPills <= 6 && kidWorldCheck.hasHeroBtn) {
      testsPassed.push(`Test 2: Modo Niño activo con 9 Mundos y solo ${kidWorldCheck.currentWorldPills} pastillas en pantalla (condensado y accesible para niños)`);
      console.log('  ✅ ' + testsPassed[testsPassed.length - 1]);
    } else {
      testsFailed.push(`Test 2: Falló Modo Niño condensado (Mundos: ${kidWorldCheck.worldButtons}, Pastillas: ${kidWorldCheck.currentWorldPills}, HeroBtn: ${kidWorldCheck.hasHeroBtn})`);
    }

    // 3. Verificar Canciones con Efecto Rainbow Neón
    console.log('🧪 TEST 3: Validación de canciones con efecto Rainbow Neón en Mundo 4...');
    const rainbowSongs = await page.evaluate(() => {
      selectedKidStage = 4;
      renderKidPathMini();
      const songPills = document.querySelectorAll('.kid-pill.is-song');
      const songBadges = document.querySelectorAll('.kid-song-badge');
      const sampleTitles = Array.from(songPills).map(p => p.querySelector('.pill-title')?.textContent || '');
      return {
        count: songPills.length,
        badges: songBadges.length,
        titles: sampleTitles
      };
    });

    if (rainbowSongs.count >= 3 && rainbowSongs.badges >= 3) {
      testsPassed.push(`Test 3: ${rainbowSongs.count} canciones detectadas con efecto Rainbow Neón y badge 🎵 CANCIÓN (${rainbowSongs.titles.join(', ')})`);
      console.log('  ✅ ' + testsPassed[testsPassed.length - 1]);
    } else {
      testsFailed.push(`Test 3: No se encontraron canciones con efecto Rainbow Neón (encontradas: ${rainbowSongs.count})`);
    }

    // 4. Verificar Modo Normal con Acordeones de Etapas
    console.log('🧪 TEST 4: Verificación de Acordeones en Modo Normal...');
    await page.evaluate(() => {
      document.body.classList.remove('kid-mode');
      storeSet('pf_kid_mode', '0');
      document.getElementById('kidPathMini').hidden = true;
      document.getElementById('pathView').hidden = false;
      expandedNormalStages[4] = true; // abrir Etapa 4 para probar canciones
      renderPath();
    });
    await page.waitForTimeout(300);

    const normalMapCheck = await page.evaluate(() => {
      const stageContainers = document.querySelectorAll('.mapStageContainer');
      const openContainers = document.querySelectorAll('.mapStageContainer.open');
      const rainbowNodes = document.querySelectorAll('.nodeItem.is-song');
      return {
        totalStages: stageContainers.length,
        openStages: openContainers.length,
        rainbowSongsInMap: rainbowNodes.length
      };
    });

    if (normalMapCheck.totalStages === 9 && normalMapCheck.openStages <= 3 && normalMapCheck.rainbowSongsInMap >= 1) {
      testsPassed.push(`Test 4: Modo Normal condensado en 9 tarjetas acordeón (abiertas por defecto: ${normalMapCheck.openStages}) con canciones Rainbow destacadas`);
      console.log('  ✅ ' + testsPassed[testsPassed.length - 1]);
    } else {
      testsFailed.push(`Test 4: Acordeón normal anómalo (etapas: ${normalMapCheck.totalStages}, abiertas: ${normalMapCheck.openStages})`);
    }

    // 5. Iniciar Práctica y Probar Flujo de Canción
    console.log('🧪 TEST 5: Flujo de práctica desde selector de mundos...');
    await page.evaluate(() => {
      // Iniciar primera canción (Martinillo o Estrellita)
      const estrellita = LEVELS.find(l => l.title.includes('Estrellita'));
      if (estrellita) startPractice(estrellita);
    });
    await page.waitForTimeout(400);

    const practiceActive = await page.evaluate(() => {
      return practice && practice.active && !document.getElementById('practice').hidden;
    });

    if (practiceActive) {
      testsPassed.push('Test 5: Canción Estrellita iniciada en modo práctica exitosamente');
      console.log('  ✅ ' + testsPassed[testsPassed.length - 1]);
    } else {
      testsFailed.push('Test 5: No se inició la práctica');
    }

    // Resumen
    console.log('\n========================================================');
    console.log(`📊 RESUMEN QA: ${testsPassed.length} PASADOS | ${testsFailed.length} FALLADOS | ${consoleErrors.length} ERRORES DE CONSOLA`);
    console.log('========================================================\n');

    if (testsFailed.length > 0 || consoleErrors.length > 0) {
      testsFailed.forEach(f => console.error('  - ' + f));
      consoleErrors.forEach(e => console.error('  - Console: ' + e));
      process.exit(1);
    } else {
      console.log('🎉 ¡TODAS LAS PRUEBAS E2E PASARON CON ÉXITO (0 ERRORES)!');
      process.exit(0);
    }

  } catch (err) {
    console.error('💥 Error crítico:', err);
    process.exit(1);
  } finally {
    if (context) await context.close();
  }
}

runTests();
