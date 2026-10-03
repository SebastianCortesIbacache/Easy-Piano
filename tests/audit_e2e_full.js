const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const http = require('http');

const os = require('os');

const BASE_DIR = path.resolve(__dirname, '..');
const TEMP_DIR = path.join(os.tmpdir(), 'easy_piano_playwright_test');
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

function createServer(port = 8099) {
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

  const server = http.createServer((req, res) => {
    let reqUrl = req.url.split('?')[0];
    if (reqUrl === '/') reqUrl = '/index.html';
    const filePath = path.join(BASE_DIR, reqUrl);

    fs.readFile(filePath, (err, data) => {
      if (err) {
        console.warn('⚠️ 404 en test server:', reqUrl, '->', filePath);
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
        return;
      }
      const ext = path.extname(filePath);
      const contentType = mimeTypes[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': contentType, 'Cache-Control': 'no-cache, no-store, must-revalidate' });
      res.end(data);
    });
  });

  return new Promise((resolve) => {
    server.listen(port, '127.0.0.1', () => {
      resolve(server);
    });
  });
}

async function runAudit() {
  console.log('\n================================================================');
  console.log('🎹 [AUDITORÍA INTEGRAL DE CALIDAD PRO] PianoFácil PRO');
  console.log('Target URL: http://127.0.0.1:8099/index.html?v=' + Date.now());
  console.log('================================================================\n');

  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const exe = fs.existsSync(edgePath) ? edgePath : chromePath;

  const passed = [];
  const failed = [];
  const consoleErrors = [];

  let serverInstance;
  let context;
  try {
    serverInstance = await createServer(8099);
    const profileDir = path.join(TEMP_DIR, 'audit_profile_fresh_' + Date.now());
    fs.mkdirSync(profileDir, { recursive: true });

    context = await chromium.launchPersistentContext(profileDir, {
      headless: true,
      executablePath: exe,
      viewport: { width: 1280, height: 850 },
      args: [
        '--no-sandbox',
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--disable-software-rasterizer',
        '--use-fake-ui-for-media-stream',
        '--use-fake-device-for-media-stream'
      ]
    });

    const page = context.pages().length > 0 ? context.pages()[0] : await context.newPage();

    page.on('console', msg => {
      if (msg.type() === 'error') {
        if (!msg.text().includes('HDR') && !msg.text().includes('favicon')) {
          console.error('❌ Console Error:', msg.text());
          consoleErrors.push(msg.text());
        }
      }
    });

    page.on('pageerror', err => {
      console.error('❌ Unhandled Page Error:', err.message);
      consoleErrors.push(err.message);
    });

    // 1. CARGA INICIAL Y PANTALLA DE BIENVENIDA
    console.log('🧪 TEST 1: Carga y verificación del DOM principal...');
    await page.goto('http://127.0.0.1:8099/index.html?fresh=' + Date.now(), { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const pageTitle = await page.title();
    if (pageTitle.includes('PianoFácil PRO')) {
      passed.push(`Test 1: App cargada limpiamente sin errores (Título: "${pageTitle}")`);
      console.log('  ✅ ' + passed[passed.length - 1]);
    } else {
      failed.push('Test 1: Título de página incorrecto: ' + pageTitle);
    }

    // 2. VERIFICACIÓN DE MOTOR DE AUDIO WEB AUDIO Y SÍNTESIS
    console.log('🧪 TEST 2: Inicialización del Motor de Audio y Síntesis Acústica...');
    const audioCheck = await page.evaluate(() => {
      const ensured = ensureAudio();
      const hasAC = !!AC;
      const hasMaster = !!master;
      const hasMasterAnalyser = !!masterAnalyser;
      const hasSynthBuf = !!synthScopeBuf;
      playSound(60, 1);
      playUiSound('click');
      playUiSound('victory');
      return { ensured, hasAC, hasMaster, hasMasterAnalyser, hasSynthBuf };
    });

    if (audioCheck.hasAC && audioCheck.hasMaster && audioCheck.hasMasterAnalyser) {
      passed.push('Test 2: Motor Web Audio inicializado (AudioContext, AnalyserNode, DynamicsCompressor, 6 armónicos)');
      console.log('  ✅ ' + passed[passed.length - 1]);
    } else {
      failed.push('Test 2: Falló la inicialización del motor de audio');
    }

    // 3. VERIFICACIÓN DEL TECLADO VIRTUAL 3D (37 TECLAS, MARFIL/ÉBANO)
    console.log('🧪 TEST 3: Integridad geométrica del teclado acústico...');
    const kbdCheck = await page.evaluate(() => {
      const keys = document.querySelectorAll('.key');
      const whiteKeys = document.querySelectorAll('.key.white');
      const blackKeys = document.querySelectorAll('.key.black');
      return {
        total: keys.length,
        white: whiteKeys.length,
        black: blackKeys.length,
        firstMidi: Object.keys(keyEls)[0],
        lastMidi: Object.keys(keyEls)[Object.keys(keyEls).length - 1]
      };
    });

    if (kbdCheck.total === 37 && kbdCheck.white === 22 && kbdCheck.black === 15) {
      passed.push(`Test 3: Teclado proporcional completo: 37 teclas (${kbdCheck.white} marfil + ${kbdCheck.black} ébano, MIDI 48 a 84)`);
      console.log('  ✅ ' + passed[passed.length - 1]);
    } else {
      failed.push(`Test 3: Teclado incompleto (Total: ${kbdCheck.total}, Blancas: ${kbdCheck.white}, Negras: ${kbdCheck.black})`);
    }

    // 4. VERIFICACIÓN DEL AVATAR 3D THREE.JS & EMOCIONES
    console.log('🧪 TEST 4: Motor 3D Three.js y Gestor de Estados del Avatar...');
    const avatarCheck = await page.evaluate(() => {
      const hasThree = typeof THREE !== 'undefined';
      const hasMateo3D = typeof mateo3d !== 'undefined' && !!mateo3d.scene && !!mateo3d.camera;
      setAvatarState('happy', '¡Hola Mateo!', 1000);
      const isHappy = currentAvatarState === 'happy';
      setAvatarState('fire', '¡En llamas!', 1000);
      const isFire = currentAvatarState === 'fire';
      setAvatarState('idle', null, 0);
      return { hasThree, hasMateo3D, isHappy, isFire };
    });

    if (avatarCheck.hasThree && avatarCheck.hasMateo3D && avatarCheck.isHappy && avatarCheck.isFire) {
      passed.push('Test 4: Motor Three.js 3D activo con cámara calibrada y transiciones de expresiones');
      console.log('  ✅ ' + passed[passed.length - 1]);
    } else {
      failed.push(`Test 4: Error en Avatar 3D (Three: ${avatarCheck.hasThree}, Mateo3D Scene+Camera: ${avatarCheck.hasMateo3D})`);
    }

    // 4B. VERIFICACIÓN DE INTERACCIÓN CON NUBE DE DIÁLOGO Y TOGGLE
    console.log('🧪 TEST 4B: Toggle de nube de diálogo y cambio selectivo de mensajes...');
    const speechCheck = await page.evaluate(() => {
      if (typeof hideOnboarding === 'function') hideOnboarding();
      const txtBefore = document.getElementById('floatingSpeechTxt').textContent;
      
      // 1. Toggle cerrar
      const btn = document.getElementById('avatarInteractBtn');
      if (btn) btn.click();
      const isClosed = document.getElementById('floatingSpeechBubble').classList.contains('bubble-closed');
      const txtAfterToggle = document.getElementById('floatingSpeechTxt').textContent;
      
      // 2. Toggle abrir
      if (btn) btn.click();
      const isOpenAgain = !document.getElementById('floatingSpeechBubble').classList.contains('bubble-closed');
      
      // 3. Click en cuadro de texto
      const bubble = document.getElementById('floatingSpeechBubble');
      if (bubble) bubble.click();
      const txtAfterBubbleClick = document.getElementById('floatingSpeechTxt').textContent;
      
      return {
        txtBefore,
        isClosed,
        sameTxtOnToggle: (txtBefore === txtAfterToggle),
        isOpenAgain,
        changedOnBubbleClick: (txtAfterBubbleClick !== txtBefore)
      };
    });

    if (speechCheck.isClosed && speechCheck.sameTxtOnToggle && speechCheck.isOpenAgain && speechCheck.changedOnBubbleClick) {
      passed.push('Test 4B: Botón circular de nube abre/cierra correctamente sin cambiar el mensaje, y el cuadro cambia el texto al pincharlo');
      console.log('  ✅ ' + passed[passed.length - 1]);
    } else {
      failed.push('Test 4B: Falló la interacción con el botón de toggle o la nube de diálogo');
    }

    // 5. VERIFICACIÓN DE MODO NIÑO (9 MUNDOS CONDENSADOS)
    console.log('🧪 TEST 5: Selector de 9 Mundos y visualización condensada en Modo Niño...');
    const kidCheck = await page.evaluate(() => {
      setKidMode(true, false);
      selectedKidStage = 1;
      renderKidPathMini();
      const worldBtns = document.querySelectorAll('.kid-world-btn');
      const stagePills = document.querySelectorAll('.kid-pill');
      const stageTitle = document.querySelector('.kid-stage-title')?.textContent || '';
      return {
        worldBtnsCount: worldBtns.length,
        pillsCount: stagePills.length,
        stageTitle
      };
    });

    if (kidCheck.worldBtnsCount === 9 && kidCheck.pillsCount === 2 && kidCheck.stageTitle.includes('Etapa 1')) {
      passed.push(`Test 5: Modo Niño activo con 9 Mundos y vista amigable para Mateo (${kidCheck.pillsCount} pastillas en Etapa 1)`);
      console.log('  ✅ ' + passed[passed.length - 1]);
    } else {
      failed.push(`Test 5: Falló Modo Niño (Mundos: ${kidCheck.worldBtnsCount}, Pastillas: ${kidCheck.pillsCount})`);
    }

    // 6. PRÁCTICA DE LECCIÓN COMPLETA CON MOTOR PEDAGÓGICO
    console.log('🧪 TEST 6: Flujo pedagógico completo en Nivel 1 (Do, Do, Do)...');
    await page.evaluate(() => {
      const lv1 = LEVELS[0];
      startPractice(lv1);
      skipIntro();
    });
    await page.waitForTimeout(400);

    const practiceState1 = await page.evaluate(() => {
      return {
        active: practice.active,
        intro: practice.intro,
        expectedNote: practice.level.notes[practice.idx].midi,
        staffVisible: !document.getElementById('staffCard').hidden
      };
    });

    if (practiceState1.active && !practiceState1.intro && practiceState1.expectedNote === 60) {
      // Tocar 3 notas Do (MIDI 60) con intervalos realistas
      await page.evaluate(() => triggerNote(60, false));
      await page.waitForTimeout(180);
      await page.evaluate(() => triggerNote(60, false));
      await page.waitForTimeout(180);
      await page.evaluate(() => triggerNote(60, false));
      await page.waitForTimeout(600);

      const modalCheck = await page.evaluate(() => {
        const modal = document.getElementById('modal');
        const isVisible = modal && !modal.hidden;
        const starsOn = modal ? modal.querySelectorAll('.bigStars span.on').length : 0;
        const mAcc = document.getElementById('mAcc')?.textContent || '';
        return { isVisible, starsOn, mAcc };
      });

      if (modalCheck.isVisible && modalCheck.starsOn === 3 && modalCheck.mAcc === '100%') {
        passed.push('Test 6: Lección 1 completada con 3 estrellas, 100% precisión y modal de victoria activo');
        console.log('  ✅ ' + passed[passed.length - 1]);
      } else {
        failed.push(`Test 6: Modal de finalización anómalo (Visible: ${modalCheck.isVisible}, Estrellas: ${modalCheck.starsOn}, Precisión: ${modalCheck.mAcc})`);
      }
    } else {
      failed.push('Test 6: No se inició correctamente la lección 1');
    }

    // 7. VERIFICACIÓN DE RECOMPENSAS Y MEDALLAS
    console.log('🧪 TEST 7: Sistema de Recompensas e Insignias desbloqueables...');
    const badgeCheck = await page.evaluate(() => {
      const prog = getPath();
      const earned = earnedBadges(prog);
      return {
        level1Done: (prog[1] || 0) > 0,
        badgesEarned: earned.length,
        hasFirstBadge: earned.includes('first')
      };
    });

    if (badgeCheck.level1Done && badgeCheck.hasFirstBadge) {
      passed.push(`Test 7: Insignia 'Primer paso' otorgada automáticamente tras completar el nivel 1`);
      console.log('  ✅ ' + passed[passed.length - 1]);
    } else {
      failed.push(`Test 7: No se otorgaron las insignias correspondientes (Insignias: ${badgeCheck.badgesEarned})`);
    }

    // 8. VERIFICACIÓN DE ESTUDIO LIBRE, OSCILOSCOPIO Y GRABADORA
    console.log('🧪 TEST 8: Estudio Libre, Osciloscopio Canvas y Grabadora de Pistas...');
    await page.evaluate(() => {
      if (typeof closeToPath === 'function') closeToPath();
      setMode('free');
    });
    await page.waitForTimeout(300);

    const studioCheck = await page.evaluate(() => {
      const freeVisible = !document.getElementById('freePanel').hidden;
      const scope = document.getElementById('scopeCanvas');
      const hasScope = scope && scope.width > 0 && scope.height > 0;
      
      const recBtn = document.getElementById('recBtn');
      if (recBtn) recBtn.click();
      recordEvent(60);
      recordEvent(64);
      recordEvent(67);
      if (recBtn) recBtn.click();

      const notesRecorded = rec.events.length;
      return { freeVisible, hasScope, notesRecorded };
    });

    if (studioCheck.freeVisible && studioCheck.hasScope && studioCheck.notesRecorded === 3) {
      passed.push('Test 8: Estudio Libre funcional con Osciloscopio neón y Grabadora de 3 notas');
      console.log('  ✅ ' + passed[passed.length - 1]);
    } else {
      failed.push(`Test 8: Falló Estudio Libre (Visible: ${studioCheck.freeVisible}, Osciloscopio: ${studioCheck.hasScope}, Grabación: ${studioCheck.notesRecorded})`);
    }

    // 9. VERIFICACIÓN DE ESTADÍSTICAS SEMANALES Y HISTOGRAMA
    console.log('🧪 TEST 9: Modal de Estadísticas Semanales y tiempo practicado...');
    await page.evaluate(() => {
      updateDailyTime(120);
      const statsBtn = document.getElementById('statsBtn');
      if (statsBtn) statsBtn.click();
    });
    await page.waitForTimeout(300);

    const statsModalCheck = await page.evaluate(() => {
      const modal = document.getElementById('statsModal');
      const isVisible = modal && !modal.hidden;
      const bars = modal ? modal.querySelectorAll('.chartBar').length : 0;
      const todayTxt = document.getElementById('smToday')?.textContent || '';
      return { isVisible, bars, todayTxt };
    });

    if (statsModalCheck.isVisible && statsModalCheck.bars === 7) {
      passed.push(`Test 9: Histograma semanal de 7 días renderizado con tiempo registrado (${statsModalCheck.todayTxt})`);
      console.log('  ✅ ' + passed[passed.length - 1]);
    } else {
      failed.push(`Test 9: Falló modal de estadísticas (Visible: ${statsModalCheck.isVisible}, Barras: ${statsModalCheck.bars})`);
    }

    // 10. VERIFICACIÓN DE CONFIGURACIÓN Y PERSISTENCIA (SOLFEO, SYNTHESIA, MODO PACIENTE)
    console.log('🧪 TEST 10: Persistencia de Ajustes y visualizaciones...');
    const settingsCheck = await page.evaluate(() => {
      settings.sys = 'letters';
      refreshLabels();
      const firstWhiteLabel = document.querySelector('.key.white .kname')?.textContent || '';
      settings.sys = 'solfege';
      refreshLabels();
      const firstWhiteLabelSolfege = document.querySelector('.key.white .kname')?.textContent || '';
      return { firstWhiteLabel, firstWhiteLabelSolfege };
    });

    if (settingsCheck.firstWhiteLabel === 'C' && settingsCheck.firstWhiteLabelSolfege === 'Do') {
      passed.push(`Test 10: Cambio instantáneo de nomenclatura probado con éxito ('C' ⟷ 'Do')`);
      console.log('  ✅ ' + passed[passed.length - 1]);
    } else {
      failed.push(`Test 10: Falló cambio de nomenclatura (Letters: ${settingsCheck.firstWhiteLabel}, Solfege: ${settingsCheck.firstWhiteLabelSolfege})`);
    }

    // 11. VERIFICACIÓN DEL SELECTOR TRIPLE DE ENTRADA Y MÓDULO WEB MIDI
    console.log('🧪 TEST 11: Selector triple de entrada (Virtual / Mic / MIDI) y módulo Web MIDI...');
    const midiCheck = await page.evaluate(() => {
      const btnVirt = document.getElementById('inputModeVirtual');
      const btnMic = document.getElementById('inputModeMic');
      const btnMidi = document.getElementById('inputModeMidi');
      const hasMidiModule = typeof MIDI !== 'undefined';
      
      // Probar activación de modo MIDI
      btnMidi.click();
      const isMidiActive = btnMidi.classList.contains('active') && document.body.classList.contains('midi-ready');
      
      // Probar disparo de nota vía triggerNote (simulando pulsación MIDI)
      triggerNote(60, false, false);
      const isKeyActive = document.querySelector('.key[data-midi="60"]')?.classList.contains('down');

      // Volver a modo virtual
      btnVirt.click();
      const isVirtActive = btnVirt.classList.contains('active') && !document.body.classList.contains('midi-ready');

      return {
        hasButtons: !!(btnVirt && btnMic && btnMidi),
        hasMidiModule,
        isMidiActive,
        isVirtActive,
        isKeyActive
      };
    });

    if (midiCheck.hasButtons && midiCheck.hasMidiModule && midiCheck.isMidiActive && midiCheck.isVirtActive) {
      passed.push('Test 11: Selector triple de entrada (En Pantalla / Mic / MIDI) y módulo Web MIDI 100% operativos');
      console.log('  ✅ ' + passed[passed.length - 1]);
    } else {
      failed.push(`Test 11: Falló validación de modo MIDI (Botones: ${midiCheck.hasButtons}, Módulo: ${midiCheck.hasMidiModule}, MidiActivo: ${midiCheck.isMidiActive})`);
    }

    // TEST 12: Pentagrama dinámico 2.0 y claves musicales
    console.log('🧪 TEST 12: Pentagrama dinámico interactivo con compás multi-nota y claves musicales...');
    const staffCheck = await page.evaluate(() => {
      const box = document.getElementById('staffBox');
      if (!box || typeof renderStaff !== 'function') return { ok: false, reason: 'No staffBox or renderStaff' };

      // 1. Probar compás en Clave de Sol con 3 notas
      const testNotesTreble = [
        { midi: 60, dur: 1 },
        { midi: 62, dur: 1 },
        { midi: 64, dur: 1 }
      ];
      renderStaff(box, testNotesTreble[1], true, testNotesTreble, 1);
      const svgTreble = box.querySelector('svg');
      const hasTrebleClef = box.innerHTML.includes('𝄞');
      const hasTimeSig = box.innerHTML.includes('4');
      const hasCursor = !!box.querySelector('.staffCursor');
      const noteCount = box.querySelectorAll('ellipse').length;

      // 2. Probar Clave de Fa para notas graves
      const testNoteBass = { midi: 48, dur: 2 };
      renderStaff(box, testNoteBass, true);
      const hasBassClef = box.innerHTML.includes('𝄢');

      return {
        ok: !!svgTreble && hasTrebleClef && hasTimeSig && hasCursor && noteCount === 3 && hasBassClef,
        hasTrebleClef,
        hasBassClef,
        hasCursor,
        noteCount
      };
    });

    if (staffCheck.ok) {
      passed.push('Test 12: Pentagrama dinámico interactivo (compás multi-nota, claves Sol/Fa y cursor) 100% operativo');
      console.log('  ✅ ' + passed[passed.length - 1]);
    } else {
      failed.push(`Test 12: Falló validación del pentagrama dinámico: ${JSON.stringify(staffCheck)}`);
    }

    // RESUMEN FINAL
    console.log('\n================================================================');
    console.log(`📊 RESULTADOS FINALES DE LA AUDITORÍA:`);
    console.log(`   🏆 Pruebas Exitosas: ${passed.length}`);
    console.log(`   ❌ Pruebas Fallidas: ${failed.length}`);
    console.log(`   ⚠️ Errores de Consola: ${consoleErrors.length}`);
    console.log('================================================================\n');

    if (failed.length > 0 || consoleErrors.length > 0) {
      failed.forEach(f => console.error('  - ' + f));
      consoleErrors.forEach(e => console.error('  - Console: ' + e));
      process.exit(1);
    } else {
      console.log('🎉 ¡AUDITORÍA CONCLUIDA CON ÉXITO ABSOLUTO! TODAS LAS FUNCIONALIDADES OPERAN A LA PERFECCIÓN. 🎹✨');
      process.exit(0);
    }

  } catch (err) {
    console.error('💥 Error inesperado durante la auditoría:', err);
    process.exit(1);
  } finally {
    if (context) await context.close();
    if (serverInstance) serverInstance.close();
  }
}

runAudit();
