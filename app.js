/* ==========================================================================
   PIANOFÁCIL PRO — LÓGICA PRINCIPAL, AUDIO ENGINE & EXPERIENCIA GAMIFICADA
   Diseñado especialmente para Mateo · Versión 3.0 PRO
   ========================================================================== */

window.addEventListener('error', function(e){
  var b = document.getElementById('errBanner');
  if(b){ b.style.display = 'block'; b.textContent = '⚠ Error: ' + (e.message || e); }
});

/* ============ ALMACENAMIENTO LOCAL ============ */
function storeGet(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } }
function storeSet(k,v){ try{ localStorage.setItem(k,v); }catch(e){} }

/* ============ HELPER DOM ============ */
function $(sel){ return document.querySelector(sel); }

/* ============ FRASES Y MENSAJES DE INTERFAZ ============ */
function renderBadges(){
  var prog = getPath();
  var earned = earnedBadges(prog);
  var bar = $('#badgesBar'); if(!bar) return;
  bar.innerHTML = '';
  BADGES.forEach(function(b){
    var on = earned.indexOf(b.id) >= 0;
    var chip = document.createElement('div');
    chip.className = 'badgeChip' + (on ? ' on' : '');
    chip.title = b.name + ' — ' + b.desc;
    chip.innerHTML = '<span class="bi">' + (on ? b.icon : '🔒') + '</span> ' + b.name;
    bar.appendChild(chip);
  });
}

function toast(txt){
  var t = $('#toast'); if(!t) return;
  t.textContent = txt; t.classList.add('show');
  clearTimeout(t._h); t._h = setTimeout(function(){ t.classList.remove('show'); }, 2600);
}

var msgTimer = null;
function showMsg(text, ms, onDone){
  var el = $('#bigMsg'); if(!el) return;
  el.innerHTML = text;
  el.classList.add('show');
  clearTimeout(msgTimer);
  msgTimer = setTimeout(function(){
    el.classList.remove('show');
    if(onDone) setTimeout(onDone, 380);
  }, ms);
}
function hideMsgNow(){
  clearTimeout(msgTimer);
  var el = $('#bigMsg'); if(el) el.classList.remove('show');
}

/* ============ MOTOR DE AVATAR DE MATEO (ESTILO GEOGUESSR / DUOLINGO 3D) ============ */
var currentAvatarState = 'idle';
var avatarResetTimer = null;

var MATEO_AVATAR_TIPS = [
  '¡Hola Mateo! Recuerda tocar con la punta de los dedos curvados como si sostuvieras una manzana 🍎',
  '¡Tus muñecas deben estar relajadas y flotando sobre el teclado! 🎹',
  '¡Papá Seba, Fer y mamá Berni están muy orgullosos de cómo tocas! 💛',
  '¡Escucha el metrónomo y siente el pulso de la música! ⏱️',
  '¡La constancia de cada día te convertirá en un gran concertista! 🌟',
  '¡Sigue la flecha dorada y las manos para no perderte ninguna nota! 🖐️',
  '¡Si fallas una nota no pasa nada! Respira hondo y sigue adelante 💪',
  '¡El piano es como un juego de magia: cada tecla es un sonido encantado! ✨',
  '¡Excelente postura de espalda de superhéroe, Mateo! ¡Listo para triunfar! 🚀'
];

function getCurrentStageNum(){
  if(practice && practice.active && practice.level) return practice.level.stage || 1;
  var prog = getPath();
  for(var s = 1; s <= 9; s++){
    if(!stageDoneIn(prog, s)) return s;
  }
  return 9;
}

function createMateoAvatarSvg(state, stage, isCompact){
  state = state || 'idle';
  stage = stage || getCurrentStageNum();
  var isFire = (state === 'fire');
  var isVictory = (state === 'victory');
  var isHappy = (state === 'happy');
  var isOops = (state === 'oops');
  var isListen = (state === 'listen');
  var isPlaying = (state === 'playing');

  var s = '<svg viewBox="0 0 100 100" class="av-svg av-state-' + state + '">';
  
  // Defs: Gradientes, sombras y filtros
  s += '<defs>';
  s += '<radialGradient id="avSkin" cx="45%" cy="40%" r="60%"><stop offset="0%" stop-color="#ffe8d1"/><stop offset="70%" stop-color="#f5c292"/><stop offset="100%" stop-color="#e09e66"/></radialGradient>';
  s += '<linearGradient id="avHair" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#4a2e18"/><stop offset="100%" stop-color="#221208"/></linearGradient>';
  s += '<linearGradient id="avCap" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#ffb547"/><stop offset="100%" stop-color="#ff7a18"/></linearGradient>';
  s += '<linearGradient id="avJacket" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#2a304e"/><stop offset="100%" stop-color="#121626"/></linearGradient>';
  s += '<linearGradient id="avGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#fff0b8"/><stop offset="50%" stop-color="#ffb547"/><stop offset="100%" stop-color="#e68a00"/></linearGradient>';
  s += '<linearGradient id="avCape" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#8b5cf6"/><stop offset="100%" stop-color="#4c1d95"/></linearGradient>';
  s += '<linearGradient id="avFlame" x1="0" y1="1" x2="0" y2="0"><stop offset="0%" stop-color="#ff4d6d"/><stop offset="50%" stop-color="#ff9800"/><stop offset="100%" stop-color="#ffd54f"/></linearGradient>';
  s += '</defs>';

  // Aura de fuego / racha (Super Saiyan)
  if(isFire){
    s += '<g class="av-aura">';
    s += '<path d="M 50,4 C 18,18 10,45 14,75 C 18,98 82,98 86,75 C 90,45 82,18 50,4 Z" fill="url(#avFlame)" opacity="0.75" style="filter:drop-shadow(0 0 14px #ff4d6d);"/>';
    s += '<path d="M 50,14 C 30,24 24,48 26,70 C 30,86 70,86 74,70 C 76,48 70,24 50,14 Z" fill="url(#avGold)" opacity="0.85"/>';
    s += '<text x="12" y="32" font-size="12">✨</text><text x="76" y="34" font-size="12">🔥</text><text x="44" y="10" font-size="12">⚡</text>';
    s += '</g>';
  }

  s += '<g class="av-char">';

  // Capa de Gran Maestro (Etapa 9)
  if(stage >= 9){
    s += '<path d="M 22,68 Q 8,96 16,100 L 84,100 Q 92,96 78,68 Z" fill="url(#avCape)" stroke="url(#avGold)" stroke-width="2"/>';
  }

  // Torso / Ropa
  s += '<path d="M 26,72 C 26,60 38,56 50,56 C 62,56 74,60 74,72 L 80,100 L 20,100 Z" fill="url(#avJacket)"/>';
  
  if(stage >= 6 && stage <= 8){
    // Corbatín dorado de concertista
    s += '<polygon points="44,66 56,66 50,70" fill="url(#avGold)"/><polygon points="44,74 56,74 50,70" fill="url(#avGold)"/><circle cx="50" cy="70" r="2.5" fill="#ffffff"/>';
  } else {
    // Cuello hoodie
    s += '<path d="M 44,56 L 50,68 L 56,56" fill="none" stroke="#ffb547" stroke-width="2.5" stroke-linecap="round"/>';
  }

  // Orejas
  s += '<ellipse cx="26" cy="46" rx="4.5" ry="6.5" fill="#f5c292"/>';
  s += '<ellipse cx="74" cy="46" rx="4.5" ry="6.5" fill="#f5c292"/>';

  // Cabeza
  s += '<ellipse cx="50" cy="44" rx="24" ry="24" fill="url(#avSkin)"/>';

  // Mejillas sonrosadas
  s += '<circle cx="34" cy="49" r="4.5" fill="#ff7f7f" opacity="0.45"/>';
  s += '<circle cx="66" cy="49" r="4.5" fill="#ff7f7f" opacity="0.45"/>';

  // Cabello base
  s += '<path d="M 26,38 C 24,18 38,15 50,15 C 64,15 76,18 74,38 C 70,30 62,25 50,25 C 38,25 30,30 26,38 Z" fill="url(#avHair)"/>';
  s += '<path d="M 34,26 C 38,18 46,18 52,23 C 58,16 68,19 70,26 C 62,21 44,21 34,26 Z" fill="#5a3820"/>';

  // Cejas
  if(isPlaying){
    s += '<line x1="33" y1="33" x2="44" y2="35" stroke="#221208" stroke-width="2.2" stroke-linecap="round"/>';
    s += '<line x1="67" y1="33" x2="56" y2="35" stroke="#221208" stroke-width="2.2" stroke-linecap="round"/>';
  } else if(isListen){
    s += '<path d="M 33,32 Q 39,28 44,32" stroke="#221208" stroke-width="2" fill="none" stroke-linecap="round"/>';
    s += '<path d="M 67,32 Q 61,28 56,32" stroke="#221208" stroke-width="2" fill="none" stroke-linecap="round"/>';
  } else if(isOops){
    s += '<line x1="33" y1="31" x2="44" y2="34" stroke="#221208" stroke-width="2" stroke-linecap="round"/>';
    s += '<line x1="67" y1="31" x2="56" y2="34" stroke="#221208" stroke-width="2" stroke-linecap="round"/>';
  } else {
    s += '<path d="M 33,32 Q 39,29 44,32" stroke="#221208" stroke-width="2" fill="none" stroke-linecap="round"/>';
    s += '<path d="M 67,32 Q 61,29 56,32" stroke="#221208" stroke-width="2" fill="none" stroke-linecap="round"/>';
  }

  // Ojos
  if(isFire){
    // Gafas de sol de estrella de rock
    s += '<path d="M 28,36 L 47,36 Q 44,47 31,45 Z" fill="#151722" stroke="url(#avGold)" stroke-width="1.8"/>';
    s += '<path d="M 53,36 L 72,36 Q 69,45 56,47 Z" fill="#151722" stroke="url(#avGold)" stroke-width="1.8"/>';
    s += '<line x1="47" y1="39" x2="53" y2="39" stroke="url(#avGold)" stroke-width="2"/>';
    s += '<line x1="31" y1="39" x2="43" y2="39" stroke="#ffffff" stroke-width="1" opacity="0.8"/>';
    s += '<line x1="56" y1="39" x2="68" y2="39" stroke="#ffffff" stroke-width="1" opacity="0.8"/>';
  } else if(isHappy || isVictory){
    // Ojos felices curvados ^ ^
    s += '<path d="M 33,42 Q 39,35 44,42" stroke="#221208" stroke-width="3.2" fill="none" stroke-linecap="round"/>';
    s += '<path d="M 56,42 Q 61,35 67,42" stroke="#221208" stroke-width="3.2" fill="none" stroke-linecap="round"/>';
  } else {
    // Ojos GeoGuessr redondos y brillantes
    s += '<ellipse class="av-eye" cx="39" cy="42" rx="4.5" ry="5.5" fill="#221208"/>';
    s += '<circle cx="37.5" cy="40" r="1.8" fill="#ffffff"/>';
    s += '<ellipse class="av-eye" cx="61" cy="42" rx="4.5" ry="5.5" fill="#221208"/>';
    s += '<circle cx="59.5" cy="40" r="1.8" fill="#ffffff"/>';
  }

  // Nariz
  s += '<path d="M 48.5,46 Q 50,48 51.5,46" stroke="#c98249" stroke-width="1.6" fill="none" stroke-linecap="round"/>';

  // Boca
  if(isHappy || isVictory){
    // Gran sonrisa abierta con dientes
    s += '<path d="M 40,49 Q 50,63 60,49 Z" fill="#d32f2f"/>';
    s += '<path d="M 42,49 Q 50,54 58,49 Z" fill="#ffffff"/>';
  } else if(isOops){
    // Sonrisa simpática de ánimo
    s += '<path d="M 44,53 Q 50,49 56,53" stroke="#b71c1c" stroke-width="2.2" fill="none" stroke-linecap="round"/>';
    s += '<text x="70" y="42" font-size="12">💧</text>';
  } else {
    // Sonrisa amistosa
    s += '<path d="M 42,50 Q 50,57 58,50" stroke="#b71c1c" stroke-width="2.5" fill="none" stroke-linecap="round"/>';
  }

  // Accesorios según la etapa:
  if(stage <= 2){
    // Etapa 1-2: Gorra de Aprendiz
    s += '<path d="M 25,28 C 25,14 75,14 75,28 Z" fill="url(#avCap)" stroke="#c26300" stroke-width="1.2"/>';
    s += '<ellipse cx="50" cy="28" rx="28" ry="6" fill="#e67e00"/>';
    s += '<text x="50" y="24" font-size="8" text-anchor="middle" fill="#fff" font-weight="bold">🎵</text>';
  } else if(stage <= 5){
    // Etapa 3-5: Audífonos Neón con LEDs pulsantes
    s += '<path d="M 22,46 C 20,14 80,14 78,46" fill="none" stroke="#161824" stroke-width="5" stroke-linecap="round"/>';
    s += '<rect x="17" y="35" width="10" height="20" rx="5" fill="#1c2032" stroke="#00e5ff" stroke-width="1.5"/>';
    s += '<circle class="av-headphone-led" cx="22" cy="45" r="3" fill="#00e5ff"/>';
    s += '<rect x="73" y="35" width="10" height="20" rx="5" fill="#1c2032" stroke="#00e5ff" stroke-width="1.5"/>';
    s += '<circle class="av-headphone-led" cx="78" cy="45" r="3" fill="#00e5ff"/>';
  } else if(stage <= 8){
    // Etapa 6-8: Estrellas brillantes de pianista concertista
    s += '<text x="16" y="24" font-size="12">✨</text><text x="74" y="24" font-size="12">⭐</text>';
  } else {
    // Etapa 9: Corona Real de Gran Maestro
    s += '<polygon points="30,20 37,28 50,13 63,28 70,20 68,31 32,31" fill="url(#avGold)" stroke="#b8860b" stroke-width="1.2"/>';
    s += '<circle cx="32" cy="21" r="2.2" fill="#ff4d6d"/>';
    s += '<circle cx="50" cy="15" r="2.6" fill="#00e5ff"/>';
    s += '<circle cx="68" cy="21" r="2.2" fill="#ff4d6d"/>';
    s += '<circle cx="50" cy="26" r="2.2" fill="#9c27b0"/>';
  }

  // Manos y Gestos:
  if(isVictory){
    // Sosteniendo trofeo dorado de campeón
    s += '<text x="72" y="85" font-size="20">🏆</text><text x="10" y="85" font-size="16">🌟</text>';
  } else if(isOops){
    // Pulgar arriba de ánimo
    s += '<text x="72" y="84" font-size="16">👍</text>';
  } else if(isFire){
    // Rock and roll
    s += '<text x="74" y="84" font-size="16">🤘</text><text x="8" y="84" font-size="16">🔥</text>';
  }

  s += '</g></svg>';
  return s;
}

function setAvatarState(state, speechMsg, resetDelayMs){
  currentAvatarState = state || 'idle';
  var stage = getCurrentStageNum();

  // 1. Renderizar en Header
  var hSvg = document.getElementById('headerAvatarSvg');
  if(hSvg) hSvg.innerHTML = createMateoAvatarSvg(currentAvatarState, stage, true);
  var hBtn = document.getElementById('headerAvatarBtn');
  if(hBtn){
    hBtn.className = 'avatarHeaderBtn' + (currentAvatarState === 'fire' ? ' av-state-fire' : '');
  }

  // 2. Renderizar en Companion Bar
  var cSvg = document.getElementById('companionAvatarSvg');
  if(cSvg){
    // prefer a portrait image if present (fallbackPortraitImg), otherwise render svg
    var pf = document.getElementById('fallbackPortraitImg');
    if(pf){
      cSvg.innerHTML = '';
      var img = pf.cloneNode(true);
      img.id = 'companionPortrait'; img.classList.add('companionPortrait');
      img.style.width = '64px'; img.style.height = '64px'; img.style.objectFit = 'cover'; img.style.borderRadius = '10px';
      cSvg.appendChild(img);
    }else{
      cSvg.innerHTML = createMateoAvatarSvg(currentAvatarState, stage, false);
    }
  }
  var cBar = document.getElementById('companionBar');
  if(cBar){
    cBar.className = 'companionBar' + (currentAvatarState === 'fire' ? ' av-state-fire' : '');
  }

  // 3. Renderizar en Modal de Victoria
  var mSvg = document.getElementById('modalAvatarSvg');
  if(mSvg){
    mSvg.innerHTML = createMateoAvatarSvg(currentAvatarState === 'victory' ? 'victory' : 'happy', stage, false);
  }

  // 4. Sincronizar Widget Flotante 3D Permanente
  var fw = document.getElementById('floatingMateoWidget');
  if(fw){
    fw.className = 'floatingWidget fw-state-' + currentAvatarState;
  }
  if(typeof updateMateo3DState === 'function'){
    updateMateo3DState(currentAvatarState);
  }

  var emotionMap = {
    'idle': '✨ Flotando',
    'listen': '🎧 Escuchando',
    'playing': '🎹 Concentrado',
    'happy': '🌟 ¡Excelente!',
    'fire': '🔥 ¡En llamas!',
    'oops': '💪 ¡Tú puedes!',
    'victory': '🏆 ¡Campeón!'
  };

  var emTag = document.getElementById('floatingEmotionTag');
  if(emTag) emTag.textContent = emotionMap[currentAvatarState] || '✨ Listo';

  // 5. Actualizar Diálogos (Companion Bar & Floating Bubble)
  if(speechMsg){
    var spTxt = document.getElementById('speechTxt');
    if(spTxt) spTxt.textContent = speechMsg;
    var spBox = document.getElementById('avatarSpeech');
    if(spBox){
      spBox.classList.remove('speechPop');
      void spBox.offsetWidth;
      spBox.classList.add('speechPop');
    }

    var flTxt = document.getElementById('floatingSpeechTxt');
    if(flTxt) flTxt.textContent = speechMsg;
    var flBubble = document.getElementById('floatingSpeechBubble');
    if(flBubble){
      flBubble.classList.remove('speechPop');
      void flBubble.offsetWidth;
      flBubble.classList.add('speechPop');
    }
  }

  // Auto-reset a estado base si se especificó duración
  clearTimeout(avatarResetTimer);
  if(resetDelayMs && resetDelayMs > 0){
    avatarResetTimer = setTimeout(function(){
      if(practice && practice.active){
        setAvatarState(practice.intro ? 'listen' : (practice.streak >= 7 ? 'fire' : 'playing'), null, 0);
      } else {
        setAvatarState('idle', null, 0);
      }
    }, resetDelayMs);
  }
}

function triggerMateoAvatarGreeting(){
  playUiSound('click');
  var tip = rnd(MATEO_AVATAR_TIPS);
  setAvatarState('happy', tip, 5000);
  toast('💬 Mateo: ' + tip);
}

/* ============ AJUSTES DE CONFIGURACIÓN ============ */
var settings = { vol: 0.8, sys: 'solfege', names: true, hints: true, staffNames: true, waitMode: false, synthesia: false };
try{ var sv = JSON.parse(storeGet('pf_settings') || '{}'); for(var sk in sv) settings[sk] = sv[sk]; }catch(e){}
function saveSettings(){ storeSet('pf_settings', JSON.stringify(settings)); }

/* ============ MOTOR AUDIO WEB HI-FI CON ANALIZADOR GLOBAL ============ */
var AC = null, master = null, masterAnalyser = null;
var synthScopeBuf = null;

function ensureAudio(){
  if(!AC){
    var Ctx = window.AudioContext || window.webkitAudioContext;
    if(!Ctx) return false;
    AC = new Ctx();
    master = AC.createGain(); master.gain.value = settings.vol;
    
    // Analizador para el Osciloscopio del sintetizador
    masterAnalyser = AC.createAnalyser();
      masterAnalyser.fftSize = 2048; // mayor resolución para notas graves
    synthScopeBuf = new Uint8Array(masterAnalyser.frequencyBinCount);
    
    var comp = AC.createDynamicsCompressor();
    comp.threshold.setValueAtTime(-18, AC.currentTime);
    comp.knee.setValueAtTime(30, AC.currentTime);
    comp.ratio.setValueAtTime(12, AC.currentTime);
    comp.attack.setValueAtTime(0.003, AC.currentTime);
    comp.release.setValueAtTime(0.25, AC.currentTime);

    master.connect(masterAnalyser);
    masterAnalyser.connect(comp);
    comp.connect(AC.destination);
  }
  if(AC.state === 'suspended') AC.resume();
  return true;
}

/* Síntesis de Sonido de Piano Acústico Enriquecido */
function playSound(m, vel){
  if(!AC) return;
  var f = 440 * Math.pow(2, (m - 69) / 12), t = AC.currentTime;
  var dec = Math.max(1.2, 2.8 - (m - 60) * 0.08); // Permitir detección hasta notas graves de piano (~27 Hz)
  
  var env = AC.createGain();
  env.gain.setValueAtTime(0, t);
  env.gain.linearRampToValueAtTime(0.42 * vel, t + 0.005);
  env.gain.exponentialRampToValueAtTime(0.0001, t + dec);
  
  var lp = AC.createBiquadFilter(); lp.type = 'lowpass';
  lp.frequency.setValueAtTime(Math.min(f * 12, 14000), t);
  lp.frequency.exponentialRampToValueAtTime(Math.max(f * 1.5, 320), t + dec * 0.75);
  
  env.connect(lp); lp.connect(master);
  
  // 6 Armónicos calibrados con ligero coro estéreo
  var H = [1, 2, 3, 4, 5, 6], G = [1, 0.5, 0.28, 0.15, 0.08, 0.04];
  var activeOscillators = [];

  H.forEach(function(h, i){
    var o = AC.createOscillator();
    o.type = (i === 0 || i === 2) ? 'sine' : 'triangle';
    o.frequency.value = f * h;
    o.detune.value = (Math.random() - 0.5) * 3.5;
    
    var og = AC.createGain();
    og.gain.value = G[i] / (1 + h * 0.14);
    
    o.connect(og); og.connect(env);
    o.start(t); o.stop(t + dec + 0.2);
    activeOscillators.push({ osc: o, gain: og });
  });

  // Limpieza defensiva de AudioNodes
  setTimeout(function(){
    activeOscillators.forEach(function(item){
      try{ item.osc.disconnect(); item.gain.disconnect(); }catch(e){}
    });
    try{ env.disconnect(); lp.disconnect(); }catch(e){}
  }, (dec + 0.3) * 1000);
}

/* Micro-sonidos UI Sintetizados Offline */
function playUiSound(type){
  if(!AC) return;
  try{
    var t = AC.currentTime;
    var osc = AC.createOscillator();
    var gain = AC.createGain();
    osc.connect(gain); gain.connect(master);
    
    if(type === 'click'){
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, t);
      osc.frequency.exponentialRampToValueAtTime(320, t + 0.04);
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
      osc.start(t); osc.stop(t + 0.05);
    } else if(type === 'victory'){
      [523.25, 659.25, 783.99, 1046.50].forEach(function(freq, idx){
        var o = AC.createOscillator();
        var g = AC.createGain();
        o.type = 'triangle';
        o.frequency.value = freq;
        g.gain.setValueAtTime(0, t + idx * 0.08);
        g.gain.linearRampToValueAtTime(0.2, t + idx * 0.08 + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t + idx * 0.08 + 0.6);
        o.connect(g); g.connect(master);
        o.start(t + idx * 0.08); o.stop(t + idx * 0.08 + 0.7);
      });
    }
  }catch(e){}
}

/* ============ AVATAR DE MATEO ESTILO GEOGUESSR ============ */
var avatarCurrentState = 'idle';
var avatarSpeechTimer = null;

function getAvatarSVG(state, stage){
  var isFire = (state === 'fire');
  var isListen = (state === 'listen');
  var isHappy = (state === 'happy');
  var isOops = (state === 'oops');
  var isVictory = (state === 'victory');
  
  var st = stage || 1;
  var hasCap = (st <= 2);
  var hasHeadphones = (st >= 3 && st <= 5) || isListen;
  var hasShades = (st >= 6 && st <= 8) || isFire;
  var hasCrown = (st >= 9) || isVictory;
  var hasCape = (st >= 9);

  var s = '<svg viewBox="0 0 100 100" class="av-char av-state-' + (state || 'idle') + '">';
  s += '<defs>';
  s += '<linearGradient id="skinG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#ffe4cb"/><stop offset="100%" stop-color="#f8be90"/></linearGradient>';
  s += '<linearGradient id="hairG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#795548"/><stop offset="100%" stop-color="#4e342e"/></linearGradient>';
  s += '<linearGradient id="shirtG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#3b82f6"/><stop offset="100%" stop-color="#1d4ed8"/></linearGradient>';
  s += '<linearGradient id="goldG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#ffd54f"/><stop offset="100%" stop-color="#ff9800"/></linearGradient>';
  s += '<linearGradient id="fireG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#ff5252"/><stop offset="100%" stop-color="#ffb142"/></linearGradient>';
  s += '</defs>';

  if(isFire){
    s += '<path d="M 50 5 Q 70 20 80 50 Q 88 80 50 95 Q 12 80 20 50 Q 30 20 50 5" fill="url(#fireG)" opacity="0.45" style="filter:blur(6px);"/>';
  }

  if(hasCape){
    s += '<path d="M 30 68 L 15 95 L 85 95 L 70 68 Z" fill="#6a1b9a" stroke="#ffd54f" stroke-width="1.5"/>';
  }

  s += '<path d="M 28 72 C 28 65 38 64 50 64 C 62 64 72 65 72 72 L 76 96 C 76 98 24 98 24 96 Z" fill="url(#shirtG)"/>';
  s += '<path d="M 46 64 L 54 64 L 52 74 L 48 74 Z" fill="#ffd54f"/>';
  s += '<rect x="44" y="60" width="12" height="8" rx="3" fill="url(#skinG)"/>';
  s += '<ellipse cx="50" cy="42" rx="22" ry="21" fill="url(#skinG)"/>';
  s += '<circle cx="28" cy="43" r="5" fill="url(#skinG)"/>';
  s += '<circle cx="72" cy="43" r="5" fill="url(#skinG)"/>';
  s += '<path d="M 28 36 C 28 20 40 18 50 18 C 60 18 72 20 72 36 C 68 28 58 26 50 26 C 42 26 32 28 28 36 Z" fill="url(#hairG)"/>';
  s += '<path d="M 32 30 C 38 22 46 22 50 24 C 54 22 62 22 68 30 C 64 26 58 25 50 25 C 42 25 36 26 32 30 Z" fill="#3e2723"/>';
  s += '<ellipse cx="36" cy="47" rx="3.5" ry="2.2" fill="#ff8a80" opacity="0.6"/>';
  s += '<ellipse cx="64" cy="47" rx="3.5" ry="2.2" fill="#ff8a80" opacity="0.6"/>';

  if(hasShades){
    s += '<path d="M 32 38 L 48 38 L 46 47 L 34 47 Z" fill="#212121" stroke="#ffd54f" stroke-width="1.2"/>';
    s += '<path d="M 52 38 L 68 38 L 66 47 L 54 47 Z" fill="#212121" stroke="#ffd54f" stroke-width="1.2"/>';
    s += '<line x1="48" y1="41" x2="52" y2="41" stroke="#ffd54f" stroke-width="1.5"/>';
    s += '<line x1="34" y1="40" x2="44" y2="45" stroke="#ffffff" stroke-width="1" opacity="0.7"/>';
  } else if(isHappy || isVictory){
    s += '<path d="M 36 42 Q 41 36 46 42" stroke="#2c1810" stroke-width="2.5" fill="none" stroke-linecap="round"/>';
    s += '<path d="M 54 42 Q 59 36 64 42" stroke="#2c1810" stroke-width="2.5" fill="none" stroke-linecap="round"/>';
  } else if(isOops){
    s += '<path d="M 37 38 L 45 42 L 37 46" stroke="#2c1810" stroke-width="2.2" fill="none" stroke-linecap="round"/>';
    s += '<path d="M 63 38 L 55 42 L 63 46" stroke="#2c1810" stroke-width="2.2" fill="none" stroke-linecap="round"/>';
  } else {
    s += '<g class="av-eye">';
    s += '<ellipse cx="41" cy="41" rx="4" ry="5.5" fill="#2c1810"/>';
    s += '<circle cx="42.5" cy="39.5" r="1.5" fill="#ffffff"/>';
    s += '<circle cx="39.5" cy="43.5" r="0.8" fill="#ffffff"/>';
    s += '<ellipse cx="59" cy="41" rx="4" ry="5.5" fill="#2c1810"/>';
    s += '<circle cx="60.5" cy="39.5" r="1.5" fill="#ffffff"/>';
    s += '<circle cx="57.5" cy="43.5" r="0.8" fill="#ffffff"/>';
    s += '</g>';
  }

  if(isHappy || isVictory || isFire){
    s += '<path class="av-mouth" d="M 43 49 Q 50 58 57 49 Z" fill="#d32f2f"/>';
    s += '<path d="M 46 49 Q 50 52 54 49 Z" fill="#ffffff"/>';
  } else if(isOops){
    s += '<path class="av-mouth" d="M 45 52 Q 50 49 55 52" stroke="#d32f2f" stroke-width="2" fill="none" stroke-linecap="round"/>';
  } else {
    s += '<path class="av-mouth" d="M 44 49 Q 50 55 56 49" stroke="#d32f2f" stroke-width="2.2" fill="none" stroke-linecap="round"/>';
  }

  if(hasCap && !hasCrown && !hasHeadphones){
    s += '<path d="M 28 32 C 28 20 42 16 50 16 C 58 16 72 20 72 32 Z" fill="#ff7043"/>';
    s += '<path d="M 50 30 Q 75 32 82 28 Q 72 36 50 33 Z" fill="#f4511e"/>';
    s += '<circle cx="50" cy="16" r="2.5" fill="#d84315"/>';
  }

  if(hasHeadphones){
    s += '<path d="M 24 44 C 24 16 76 16 76 44" stroke="#00e5ff" stroke-width="3.5" fill="none" stroke-linecap="round" style="filter:drop-shadow(0 0 6px #00e5ff);"/>';
    s += '<rect x="22" y="36" width="7" height="15" rx="3.5" fill="#8b6cff" stroke="#00e5ff" stroke-width="1.5"/>';
    s += '<rect x="71" y="36" width="7" height="15" rx="3.5" fill="#8b6cff" stroke="#00e5ff" stroke-width="1.5"/>';
  }

  if(hasCrown){
    s += '<path d="M 34 22 L 38 12 L 50 18 L 62 12 L 66 22 Z" fill="url(#goldG)" stroke="#fff" stroke-width="1.2" style="filter:drop-shadow(0 0 8px #ffd54f);"/>';
    s += '<circle cx="50" cy="19" r="2" fill="#e91e63"/>';
  }

  if(isVictory){
    s += '<g transform="translate(68, 48) scale(0.6)">';
    s += '<path d="M 10 10 L 30 10 L 25 25 Q 20 32 15 25 Z" fill="url(#goldG)"/>';
    s += '<path d="M 18 30 L 22 30 L 22 38 L 18 38 Z" fill="#ff9800"/>';
    s += '<rect x="14" y="38" width="12" height="6" rx="2" fill="#424242"/>';
    s += '</g>';
  }

  s += '</svg>';
  return s;
}

function setAvatarState(state, speechMsg, durationMs){
  avatarCurrentState = state || 'idle';
  var prog = getPath();
  var currLevel = continueLevel(prog) || LEVELS[0];
  var stage = (practice.active && practice.level) ? practice.level.stage : currLevel.stage;

  var headerSvg = document.getElementById('headerAvatarSvg');
  if(headerSvg) headerSvg.innerHTML = getAvatarSVG(avatarCurrentState, stage);

  var companionSvg = document.getElementById('companionAvatarSvg');
  if(companionSvg) companionSvg.innerHTML = getAvatarSVG(avatarCurrentState, stage);

  var speechBox = document.getElementById('speechTxt');
  if(speechBox && speechMsg){
    speechBox.textContent = speechMsg;
  }

  if(durationMs){
    clearTimeout(avatarSpeechTimer);
    avatarSpeechTimer = setTimeout(function(){
      if(practice.active){
        var normalMsg = 'Sigue la flecha dorada y el ritmo 🎶';
        if(practice.streak >= 5) normalMsg = '🔥 ¡Racha de ' + practice.streak + '! ¡Estás en llamas, Mateo!';
        setAvatarState(practice.streak >= 5 ? 'fire' : 'idle', normalMsg, 0);
      }
    }, durationMs);
  }
}

if($('#headerAvatarBtn')){
  $('#headerAvatarBtn').addEventListener('click', function(){
    playUiSound('click');
    var tips = [
      '¡Hola, Mateo! Tu papá Seba, Fer y Bernardita están muy orgullosos de tu avance 💛',
      'Recuerda curvar tus dedos como garritas de superhéroe 🦸',
      '¡Cada día tocas con mejor ritmo y soltura! 🎶',
      'Si una canción es difícil, tócala despacito al principio 🐢',
      '¡Vamos por esas 3 estrellas en cada nivel! ⭐⭐⭐'
    ];
    var randomTip = tips[Math.floor(Math.random() * tips.length)];
    setAvatarState('happy', randomTip, 3500);
    toast('👦 Mateo: ' + randomTip);
  });
}

/* ============ PIANO VIRTUAL 3D ============ */
var piano = $('#piano'), keyEls = {};

var BLACK = [1, 3, 6, 8, 10];

function rebuildPiano(){
  // Build absolute-positioned keyboard to avoid flex rounding issues in some browsers
  keyEls = {};
  var pianoEl = document.getElementById('piano'); if(!pianoEl) return;
  pianoEl.innerHTML = '';
  pianoEl.style.position = pianoEl.style.position || 'relative';

  // Gather white key midis and count
  var whiteMidis = [];
  for(var m = FIRST; m <= LAST; m++){ if(BLACK.indexOf(m % 12) < 0) whiteMidis.push(m); }
  var whiteCount = whiteMidis.length || 1;
  // compute sizes using available parent/container width to keep keys responsive
  var wrap = pianoEl.parentElement || document.getElementById('pianoWrap');
  var availableW = (wrap && wrap.clientWidth) || pianoEl.clientWidth || pianoEl.getBoundingClientRect().width || 800;
  var baseW = Math.floor(availableW / whiteCount);
  var remainder = availableW - baseW * whiteCount;

  // create white keys positioned absolutely
  var curLeft = 0;
  var whiteLeftMap = {};
  for(var i = 0; i < whiteMidis.length; i++){
    var midi = whiteMidis[i];
    var w = baseW + (i < remainder ? 1 : 0);
    var el = document.createElement('div'); el.className = 'key white absolute'; el.style.position = 'absolute'; el.style.left = curLeft + 'px'; el.style.width = w + 'px'; el.style.top = '0'; el.style.bottom = '0';
    var nm = document.createElement('span'); nm.className = 'kname'; el.appendChild(nm);
    var kh = document.createElement('span'); kh.className = 'khint'; kh.textContent = (MIDITOKEY[midi] || '').toUpperCase(); el.appendChild(kh);
    pianoEl.appendChild(el);
    keyEls[midi] = el;
    whiteLeftMap[midi] = { left: curLeft, width: w };
    curLeft += w;
  }

  // create black keys and position between adjacent whites
  for(var m = FIRST; m <= LAST; m++){
    if(BLACK.indexOf(m % 12) < 0) continue;
    var leftWhite = null, rightWhite = null;
    for(var a = m - 1; a >= FIRST; a--){ if(keyEls[a] && keyEls[a].classList.contains('white')){ leftWhite = a; break; } }
    for(var b = m + 1; b <= LAST; b++){ if(keyEls[b] && keyEls[b].classList.contains('white')){ rightWhite = b; break; } }
    if(leftWhite == null || rightWhite == null) continue;
    var linfo = whiteLeftMap[leftWhite]; var rinfo = whiteLeftMap[rightWhite];
    var center = Math.round(linfo.left + linfo.width/2 + rinfo.left + rinfo.width/2) / 2;
    var avgW = Math.round((linfo.width + rinfo.width) / 2) || baseW;
    var blackW = Math.max(12, Math.round(avgW * 0.54)); blackW = Math.min(blackW, Math.round(avgW * 0.68));
    var leftPx = Math.round(center - blackW/2);
    // clamp within available width
    leftPx = Math.max(0, Math.min(leftPx, availableW - blackW));
    var bel = document.createElement('div'); bel.className = 'key black absolute'; bel.style.position = 'absolute'; bel.style.left = leftPx + 'px'; bel.style.width = blackW + 'px'; bel.style.top = '0'; bel.style.height = '60%';
    var kh2 = document.createElement('span'); kh2.className = 'khint'; kh2.textContent = (MIDITOKEY[m] || '').toUpperCase(); bel.appendChild(kh2);
    pianoEl.appendChild(bel);
    keyEls[m] = bel;
  }

  // Attach input handlers (pointer/mouse/touch/context) to each key element
  for(var mm = FIRST; mm <= LAST; mm++){
    (function(m){ var el = keyEls[m]; if(!el) return;
      if(window.PointerEvent){
        el.addEventListener('pointerdown', function(ev){ if(ev.cancelable) ev.preventDefault(); try{ el.releasePointerCapture(ev.pointerId); }catch(e){} el._downPid = ev.pointerId; triggerNote(m, false); });
        el.addEventListener('pointerenter', function(ev){ if(ev.buttons && (ev.buttons & 1) && ev.pointerId !== el._downPid) triggerNote(m, false); });
        el.addEventListener('pointerup', function(ev){ if(ev.pointerId === el._downPid) el._downPid = -1; });
      }else{
        el.addEventListener('mousedown', function(ev){ if(ev.cancelable) ev.preventDefault(); triggerNote(m, false); });
        el.addEventListener('touchstart', function(ev){ ev.preventDefault(); triggerNote(m, false); }, { passive: false });
      }
      el.addEventListener('contextmenu', function(ev){ ev.preventDefault(); });
    })(mm);
  }
  // Final layout sanity run
  // Keep piano element width responsive and ensure parent can scroll horizontally if needed
  try{ pianoEl.style.width = '100%'; if(wrap) wrap.style.overflowX = 'auto'; }catch(e){}
  adjustBlackKeyLayoutOnce();
  // clear any lingering error or hint classes from previous builds
  try{ clearHints(); clearErrors(); }catch(e){}
}

// Global cleanup: ensure no key remains stuck in 'down' state if pointers are cancelled
function clearAllDownStates(){
  try{
    for(var k in keyEls){ if(!keyEls.hasOwnProperty(k)) continue; var el = keyEls[k]; if(!el) continue; try{ el.classList.remove('down'); }catch(e){} try{ clearTimeout(el._t); }catch(e){} el._downPid = -1; }
  }catch(e){}
}

// Listen for global pointer/touch/mouse end events to avoid stuck key lights
window.addEventListener('pointerup', function(){ clearAllDownStates(); });
window.addEventListener('pointercancel', function(){ clearAllDownStates(); });
window.addEventListener('mouseup', function(){ clearAllDownStates(); });
window.addEventListener('touchend', function(){ clearAllDownStates(); });
window.addEventListener('touchcancel', function(){ clearAllDownStates(); });
document.addEventListener('visibilitychange', function(){ if(document.hidden) clearAllDownStates(); });

function adjustBlackKeyLayout(){
  try{
    var pianoEl = document.getElementById('piano'); if(!pianoEl) return;
    var containerRect = pianoEl.getBoundingClientRect();
    // Ensure piano container is positioned for absolute children
    pianoEl.style.position = pianoEl.style.position || 'relative';
    // Compute explicit width for white keys to avoid fractional rounding issues in Chrome
    var whiteKeys = [];
    for(var mm0 = FIRST; mm0 <= LAST; mm0++){ var e0 = keyEls[mm0]; if(e0 && e0.classList && e0.classList.contains('white')) whiteKeys.push(e0); }
    var whiteCount = whiteKeys.length || 1;
    var containerInner = pianoEl.clientWidth || Math.round(containerRect.width);
    var whiteW = Math.max(12, Math.floor(containerInner / whiteCount));
    // Apply explicit pixel widths to white keys (fixes Chrome subpixel overlap)
    whiteKeys.forEach(function(wk){ wk.style.flex = '0 0 ' + whiteW + 'px'; wk.style.width = whiteW + 'px'; wk.style.boxSizing = 'border-box'; wk.style.position = 'relative'; });
    for(var mm = FIRST; mm <= LAST; mm++){
      var el = keyEls[mm]; if(!el) continue;
      if(el.classList.contains('black')){
        var leftWhite = null, rightWhite = null;
        for(var a = mm - 1; a >= FIRST; a--){ if(keyEls[a] && keyEls[a].classList && keyEls[a].classList.contains('white')){ leftWhite = keyEls[a]; break; } }
        for(var b = mm + 1; b <= LAST; b++){ if(keyEls[b] && keyEls[b].classList && keyEls[b].classList.contains('white')){ rightWhite = keyEls[b]; break; } }
        if(!leftWhite || !rightWhite) continue;
        // Prefer offset measurements relative to piano container to avoid viewport rounding issues
        var cLeft = pianoEl.offsetLeft || 0;
        var lCenter = leftWhite.offsetLeft + Math.round(leftWhite.offsetWidth / 2);
        var rCenter = rightWhite.offsetLeft + Math.round(rightWhite.offsetWidth / 2);
        var center = Math.round((lCenter + rCenter) / 2);
        var avgW = Math.round((leftWhite.offsetWidth + rightWhite.offsetWidth) / 2) || whiteW;
        // Choose a conservative black key width (around 54% of a white key)
        var blackW = Math.max(12, Math.round(avgW * 0.54));
        blackW = Math.min(blackW, Math.max(12, Math.round(avgW * 0.68)));
        var leftPx = center - Math.round(blackW / 2);
        // clamp inside container bounds
        leftPx = Math.max(0, Math.min(leftPx, pianoEl.clientWidth - blackW));
        el.style.width = blackW + 'px';
        el.style.left = leftPx + 'px';
        el.style.position = 'absolute';
        el.style.zIndex = 6;
        el.style.boxSizing = 'border-box';
      }
    }
    // Re-run once after a short delay to catch late layout shifts (fonts, images)
    setTimeout(function(){ try{ adjustBlackKeyLayoutOnce(); }catch(e){} }, 90);
  }catch(e){ console.warn('adjustBlackKeyLayout failed', e); }
}

// Single-pass layout helper used by the short re-run to avoid recursion
function adjustBlackKeyLayoutOnce(){
  try{
    var pianoEl = document.getElementById('piano'); if(!pianoEl) return;
    var containerRect = pianoEl.getBoundingClientRect();
    var whiteKeys = [];
    for(var mm0 = FIRST; mm0 <= LAST; mm0++){ var e0 = keyEls[mm0]; if(e0 && e0.classList && e0.classList.contains('white')) whiteKeys.push(e0); }
    var whiteCount = whiteKeys.length || 1;
    var containerInner = pianoEl.clientWidth || Math.round(containerRect.width);
    var whiteW = Math.max(12, Math.floor(containerInner / whiteCount));
    whiteKeys.forEach(function(wk){ wk.style.flex = '0 0 ' + whiteW + 'px'; wk.style.width = whiteW + 'px'; wk.style.boxSizing = 'border-box'; wk.style.position = 'relative'; });
    for(var mm = FIRST; mm <= LAST; mm++){
      var el = keyEls[mm]; if(!el || !el.classList.contains('black')) continue;
      var leftWhite = null, rightWhite = null;
      for(var a = mm - 1; a >= FIRST; a--){ if(keyEls[a] && keyEls[a].classList && keyEls[a].classList.contains('white')){ leftWhite = keyEls[a]; break; } }
      for(var b = mm + 1; b <= LAST; b++){ if(keyEls[b] && keyEls[b].classList && keyEls[b].classList.contains('white')){ rightWhite = keyEls[b]; break; } }
      if(!leftWhite || !rightWhite) continue;
      var rL = leftWhite.getBoundingClientRect(); var rR = rightWhite.getBoundingClientRect();
      var center = Math.round((rL.left + rL.width/2 + rR.left + rR.width/2) / 2);
      var avgW = Math.round((rL.width + rR.width) / 2) || whiteW;
      var blackW = Math.max( Math.round(avgW * 0.48), 12 );
      blackW = Math.min(blackW, Math.max(12, Math.round(avgW * 0.6)));
      var leftPx = Math.round(center - blackW/2 - containerRect.left);
      leftPx = Math.max(0, Math.min(leftPx, Math.round(containerRect.width - blackW)));
      el.style.width = blackW + 'px'; el.style.left = leftPx + 'px'; el.style.position = 'absolute'; el.style.zIndex = 6;
    }
  }catch(e){ console.warn('adjustBlackKeyLayoutOnce failed', e); }
}

// Recompute black key layout on resize (debounced)
var _kbdResizeTimer = null; window.addEventListener('resize', function(){ clearTimeout(_kbdResizeTimer); _kbdResizeTimer = setTimeout(function(){ try{ rebuildPiano(); }catch(e){} }, 120); });

// build piano on load
try{ rebuildPiano(); }catch(e){ console.warn('rebuildPiano error', e); }

// Piano scale (zoom) control: adds a small UI to adjust keyboard scale and persists choice
function applyPianoScale(s){
  try{
    var p = document.getElementById('piano'); if(!p) return;
    var val = parseFloat(s) || 1;
    p.style.transform = 'scale(' + val + ')';
    // ensure black keys keep correct z-index after scaling
    p.querySelectorAll('.key.black').forEach(function(b){ b.style.zIndex = 6; });
  }catch(e){}
}

function createPianoScaleControl(){
  try{
    var wrap = document.getElementById('pianoWrap'); if(!wrap) return;
    // avoid duplicating control
    if(document.getElementById('pianoScaleControl')) return;
    var ctrl = document.createElement('div'); ctrl.id = 'pianoScaleControl';
    ctrl.innerHTML = '<button id="ps-dec">−</button><input id="ps-range" type="range" min="0.6" max="1.2" step="0.05" value="1"><button id="ps-inc">+</button>';
    wrap.appendChild(ctrl);
    var range = document.getElementById('ps-range'); var dec = document.getElementById('ps-dec'); var inc = document.getElementById('ps-inc');
    var stored = parseFloat(localStorage.getItem('pf_piano_scale') || '1');
    if(stored && !isNaN(stored)) { range.value = stored; applyPianoScale(stored); }
    var setVal = function(v){ range.value = v; applyPianoScale(v); localStorage.setItem('pf_piano_scale', v); };
    range.addEventListener('input', function(){ setVal(this.value); });
    dec.addEventListener('click', function(){ var v = Math.max(0.6, Math.round((parseFloat(range.value)-0.05)*100)/100); setVal(v); });
    inc.addEventListener('click', function(){ var v = Math.min(1.2, Math.round((parseFloat(range.value)+0.05)*100)/100); setVal(v); });
  }catch(e){}
}

// create control once DOM ready
setTimeout(function(){ try{ createPianoScaleControl(); }catch(e){} }, 300);

// Replace floating 3D widget with portrait PNG if available (non-blocking)
function tryUsePortraitPNG(){
  try{
    var candidates = [
      'mateo_chibi_portrait.png',
      'mateo_chibi_portrait.jpg',
      'www/mateo_chibi_portrait.png',
      'www/mateo_chibi_portrait.jpg',
      'assets/mateo_chibi_portrait.png',
      'assets/mateo_chibi_portrait.jpg',
      'www/assets/mateo_chibi_portrait.png',
      'www/assets/mateo_chibi_portrait.jpg'
    ];
    var tryNext = function(i){
      if(i >= candidates.length) return;
      var candidate = candidates[i];
      var img = new Image(); img.src = candidate + '?_v=' + (new Date()).getTime();
      img.onload = function(){
        // Replace companion portrait with PNG (but keep floating 3D widget)
        var fp = document.getElementById('fallbackPortraitImg');
        if(fp) fp.src = candidate;
        var cSvg = document.getElementById('companionAvatarSvg');
        var replaceImg = function(target){
          if(!target) return;
          if(target.tagName && target.tagName.toLowerCase() === 'img'){
            target.src = candidate;
            return;
          }
          target.innerHTML = '';
          var n = document.createElement('img'); n.src = candidate; n.className = 'companionPortrait'; n.style.width='64px'; n.style.height='64px'; n.style.objectFit='cover'; n.style.borderRadius='10px'; target.appendChild(n);
        };
        if(cSvg) replaceImg(cSvg);
        // Also replace any companion avatar containers and fallback portrait imgs across the UI
        try{
          document.querySelectorAll('.companionAvatar').forEach(function(el){ replaceImg(el); });
          document.querySelectorAll('.fallbackPortrait').forEach(function(el){ replaceImg(el); });
          var header = document.getElementById('headerAvatarImg'); if(header) replaceImg(header);
          var modal = document.getElementById('modalAvatarSvg'); if(modal) replaceImg(modal);
        }catch(e){}
        // Do NOT modify the floating widget: keep the GLB canvas intact
        // Also replace header avatar fallback image if present
        var hpf = document.getElementById('headerAvatarImg'); if(hpf) hpf.src = candidate;
      };
      img.onerror = function(){ tryNext(i+1); };
    };
    tryNext(0);
    // remove any floating portrait badges left by previous runs
    try{ document.querySelectorAll('.floatingPortraitBadge').forEach(function(n){ n.remove(); }); }catch(e){}
  }catch(e){ }
}
tryUsePortraitPNG();

// Force-insert portrait image for Mateo as a last resort (runs shortly after load)
function forceInsertMateoPortrait(){
  try{
    var primary = 'mateo_chibi_portrait.png';
    var fallback = 'mateo_chibi_portrait.jpg';
    var doReplace = function(src){
      if(!src) return;
      var makeImg = function(s){ var n = document.createElement('img'); n.src = s; n.className = 'companionPortrait'; n.style.width='64px'; n.style.height='64px'; n.style.objectFit='cover'; n.style.borderRadius='10px'; return n; };
      var selectors = ['#companionAvatarSvg', '.companionAvatar', '#fallbackPortraitImg', '.fallbackPortrait', '#headerAvatarImg', '#modalAvatarSvg'];
      selectors.forEach(function(sel){
        try{ document.querySelectorAll(sel).forEach(function(el){
          if(!el) return;
          if(el.tagName && el.tagName.toLowerCase() === 'img'){
            el.src = src;
          }else{
            // clear and append img
            el.innerHTML = '';
            el.appendChild(makeImg(src));
          }
        }); }catch(e){}
      });
    };

    var img = new Image(); img.src = primary + '?_v=' + (new Date()).getTime();
    img.onload = function(){ doReplace(primary); };
    img.onerror = function(){ var img2 = new Image(); img2.src = fallback + '?_v=' + (new Date()).getTime(); img2.onload = function(){ doReplace(fallback); }; img2.onerror = function(){ /* nothing found */ }; };
  }catch(e){}
}
setTimeout(forceInsertMateoPortrait, 250);

function refreshLabels(){
  for(var m = FIRST; m <= LAST; m++){
    var el = keyEls[m]; if(!el) continue;
    var nm = el.querySelector('.kname');
    if(nm){ var pc = midiToPC(m); nm.textContent = settings.sys === 'solfege' ? SOL[pc] : pc; nm.style.display = settings.names ? '' : 'none'; }
    var kh = el.querySelector('.khint'); if(kh) kh.style.display = settings.hints ? '' : 'none';
  }
}

/* ============ DISPARO DE NOTAS & EFECTOS ARCADE ============ */
var _lastNoteMidi = null, _lastNoteTime = 0;
function triggerNote(m, silent, internal){
  var now = performance.now();
  if(!internal && m === _lastNoteMidi && (now - _lastNoteTime) < 100) return; // Ajuste de tiempo para mejorar la respuesta
  _lastNoteMidi = m; _lastNoteTime = now;
  if(practice.intro && !internal) return;
  if(!silent){ ensureAudio(); playSound(m, 1); }
  flash(m);
  recordEvent(m);
  judge(m);
}
function flash(m){
  var el = keyEls[m]; if(!el) return;
  el.classList.remove('down'); void el.offsetWidth; el.classList.add('down');
  clearTimeout(el._t); el._t = setTimeout(function(){ el.classList.remove('down'); }, 220);
  burst(m, false);
}

function burst(m, big){
  var el = keyEls[m]; if(!el) return;
  var pianoWrap = $('#pianoWrap'); if(!pianoWrap) return;
  var r = el.getBoundingClientRect(), w = pianoWrap.getBoundingClientRect();
  var x = r.left + r.width / 2 - w.left, y = r.top - w.top + 6, fx = $('#fx'); if(!fx) return;

  // Onda divergente (Ripple)
  var rip = document.createElement('i'); rip.className = 'keyRipple';
  rip.style.left = x + 'px'; rip.style.top = y + 'px';
  fx.appendChild(rip);
  rip.addEventListener('animationend', function(){ this.remove(); });

  // Chispas arcade y notas musicales flotantes
  var symbols = ['🎵', '🎶', '✨', '⭐', '🎹', '💫', '🌟'];
  var colors = ['#ffb547', '#8b6cff', '#3ddc84', '#ff4d6d', '#00e5ff', '#ffd276'];
  var n = big ? 14 : 6;
  for(var i = 0; i < n; i++){
    var p = document.createElement('i'); p.className = 'pt';
    p.style.left = x + 'px'; p.style.top = y + 'px';
    if(Math.random() < 0.45){
      p.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    }else{
      p.style.background = colors[Math.floor(Math.random() * colors.length)];
      p.style.width = '9px'; p.style.height = '9px'; p.style.borderRadius = '50%';
      p.style.boxShadow = '0 0 10px ' + colors[Math.floor(Math.random() * colors.length)];
    }
    p.style.setProperty('--dx', (Math.random() * 90 - 45) + 'px');
    p.style.setProperty('--dy', (-35 - Math.random() * 85) + 'px');
    fx.appendChild(p);
    p.addEventListener('animationend', function(){ this.remove(); });
  }
}

/* ============ OSCILOSCOPIO & ESPECTRO EN VIVO CANVAS ============ */
var scopeCanvas = document.getElementById('scopeCanvas');
var scopeCtx = scopeCanvas ? scopeCanvas.getContext('2d') : null;
var scopeRaf = null;

function renderOscilloscope(){
  if(!scopeCtx || !scopeCanvas) return;
  scopeRaf = requestAnimationFrame(renderOscilloscope);
  
  var w = scopeCanvas.width = scopeCanvas.offsetWidth;
  var h = scopeCanvas.height = scopeCanvas.offsetHeight;
  
  // Fondo oscuro con rejilla sutil
  scopeCtx.fillStyle = '#070913';
  scopeCtx.fillRect(0, 0, w, h);
  
  // Línea central guía
  scopeCtx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  scopeCtx.lineWidth = 1;
  scopeCtx.beginPath();
  scopeCtx.moveTo(0, h / 2);
  scopeCtx.lineTo(w, h / 2);
  scopeCtx.stroke();
  
  var dataBuf = null;
  var isMic = micActive && analyser && micBuf;
  
  if(isMic){
    dataBuf = micBuf;
  } else if(masterAnalyser && synthScopeBuf){
    masterAnalyser.getByteTimeDomainData(synthScopeBuf);
  }
  
  // Dibujar Onda de Audio Neón Cyan/Gold
  scopeCtx.lineWidth = 2.5;
  scopeCtx.strokeStyle = isMic ? '#00e5ff' : '#ff9800'; // Cambiar color para mejor visibilidad
  scopeCtx.shadowColor = isMic ? 'rgba(0, 229, 255, 0.8)' : 'rgba(255, 181, 71, 0.8)';
  scopeCtx.shadowBlur = 10;
  scopeCtx.beginPath();

  if(isMic && dataBuf){
    var sliceW = w / dataBuf.length;
    var sx = 0;
    for(var i = 0; i < dataBuf.length; i++){
      var v = dataBuf[i];
      var sy = (v * 0.5 + 0.5) * h;
      if(i === 0) scopeCtx.moveTo(sx, sy);
      else scopeCtx.lineTo(sx, sy);
      sx += sliceW;
    }
  } else if(synthScopeBuf){
    var sliceW2 = w / synthScopeBuf.length;
    var sx2 = 0;
    for(var j = 0; j < synthScopeBuf.length; j++){
      var v2 = (synthScopeBuf[j] - 128) / 128;
      var sy2 = (v2 * 0.5 + 0.5) * h;
      if(j === 0) scopeCtx.moveTo(sx2, sy2);
      else scopeCtx.lineTo(sx2, sy2);
      sx2 += sliceW2;
    }
  } else {
    scopeCtx.moveTo(0, h / 2);
    scopeCtx.lineTo(w, h / 2);
  }
  
  scopeCtx.stroke();
  scopeCtx.shadowBlur = 0;
}
if(scopeCanvas) requestAnimationFrame(renderOscilloscope);

/* ============ MICRÓFONO & PITCH DETECTION PRO ============ */
var micStream = null, micSrc = null, micFilterNode = null, analyser = null, micBuf = null, rafId = null, micActive = false;
var smoothMidi = null, pendingMidi = null, stable = 0, wasSilent = true, lastEmitT = 0, lastEmitMidi = null;
var micGain = 1.0; // multiplicador aplicado a la señal del mic

function gateVal(){
  var el = document.getElementById('sens');
  return 0.0005 * Math.pow(10, ((el ? parseFloat(el.value) : 50) / 50));
}
function octShift(){
  var el = document.getElementById('octSel');
  return el ? parseInt(el.value, 10) || 0 : 0;
}

function detectPitch(buf, sr, gate){
  var N = buf.length, rms = 0, i;
  for(i = 0; i < N; i++){ var v = buf[i]; rms += v * v; }
  rms = Math.sqrt(rms / N);
  if(rms < gate) return { rms: rms, freq: 0 };
  var minLag = Math.max(2, Math.floor(sr / 1100));
  // Expandir el rango para capturar notas graves de piano (~27 Hz)
  var maxLag = Math.min(N - 2, Math.floor(sr / 27));
  var energy = 0; for(i = 0; i < N; i += 2) energy += buf[i] * buf[i];
  var bestLag = -1, best = 0, lag;
  for(lag = minLag; lag <= maxLag; lag++){
    var s = 0;
    for(i = 0; i < N - lag; i += 2) s += buf[i] * buf[i + lag];
    if(s > best){ best = s; bestLag = lag; }
  }
  if(bestLag < 0 || best < energy * 0.2) return { rms: rms, freq: 0 };
  function corr(l){ var t = 0; for(var j = 0; j < N - l; j += 2) t += buf[j] * buf[j + l]; return t; }
  var prev = corr(bestLag - 1), next = corr(bestLag + 1);
  var a = (prev + next - 2 * best) / 2, b = (next - prev) / 2;
  var refined = bestLag; if(a) refined = bestLag - b / (2 * a);
  var freq = sr / Math.max(1, refined);
  if(freq < 27 || freq > 1200) return { rms: rms, freq: 0 };
  return { rms: rms, freq: freq };
}

function startMic(){
  if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){
    $('#micDot').className = 'dot err';
    $('#micStatus').textContent = 'Tu navegador no permite micrófono aquí.';
    return;
  }
  if(!ensureAudio()){ $('#micStatus').textContent = 'Audio no disponible.'; return; }
  $('#micStatus').textContent = 'Pidiendo permiso…';
  navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } })
  .then(function(stream){
    micStream = stream;
    micSrc = AC.createMediaStreamSource(stream);
    micFilterNode = AC.createBiquadFilter();
    micFilterNode.type = 'lowpass';
    micFilterNode.frequency.value = 1400;
    micSrc.connect(micFilterNode);

    analyser = AC.createAnalyser(); analyser.fftSize = 4096; // mayor resolución para notas graves
    micBuf = new Float32Array(analyser.fftSize);
    micFilterNode.connect(analyser);

    // Apply stored mic gain if present
    try{ var mg = parseFloat(storeGet('pf_mic_gain') || '1'); if(mg && !isNaN(mg)) micGain = mg; }catch(e){}

    micActive = true; smoothMidi = null; pendingMidi = null; stable = 0; wasSilent = true;
    $('#micBtn').textContent = '⏹ Detener Micrófono';
    $('#micDot').className = 'dot on';
    $('#micStatus').textContent = 'Escuchando el piano de Mateo… 🎧';
    micLoop();
  })
  .catch(function(){
    $('#micDot').className = 'dot err';
    $('#micStatus').textContent = 'No se pudo acceder al micrófono.';
  });
}

function stopMic(){
  micActive = false;
  cancelAnimationFrame(rafId);
  if(micStream){ micStream.getTracks().forEach(function(t){ t.stop(); }); }
  micStream = null;
  $('#micBtn').textContent = '🎤 Activar micrófono';
  $('#micDot').className = 'dot';
  $('#micStatus').textContent = 'Micrófono apagado';
  if($('#meterFill')) $('#meterFill').style.width = '0%';
}

function micLoop(){
  if(!micActive) return;
  rafId = requestAnimationFrame(micLoop);
  analyser.getFloatTimeDomainData(micBuf);
  // Apply mic gain into a temporary buffer to avoid mutating analyser buffer
  if(micGain && Math.abs(micGain - 1.0) > 0.0001){
    var scaled = new Float32Array(micBuf.length);
    for(var i = 0; i < micBuf.length; i++) scaled[i] = micBuf[i] * micGain;
    micFrame(detectPitch(scaled, AC.sampleRate, gateVal()));
  } else {
    micFrame(detectPitch(micBuf, AC.sampleRate, gateVal()));
  }
}

function micFrame(res){
  var mf = document.getElementById('meterFill');
  if(mf) mf.style.width = Math.min(100, res.rms * 600) + '%';
  if(!res.freq){
    if(res.rms < gateVal()){ pendingMidi = null; stable = 0; wasSilent = true; smoothMidi = null; }
    return;
  }
  var fm = 69 + 12 * Math.log2(res.freq / 440) + octShift() * 12;
  smoothMidi = (smoothMidi == null) ? fm : smoothMidi + (fm - smoothMidi) * 0.45;
  var midi = Math.round(smoothMidi);
  var pc = midiToPC(midi);
  var dn = document.getElementById('detNote');
  var dh = document.getElementById('detHz');
  if(dn) dn.textContent = settings.sys === 'solfege' ? SOL[pc] : pc;
  if(dh) dh.textContent = pc + midiToOct(midi) + ' · ' + Math.round(res.freq) + ' Hz';
  if(midi === pendingMidi) stable++; else { pendingMidi = midi; stable = 1; }
  if(stable === 6){
    var now = performance.now();
    var ok = (wasSilent || midi !== lastEmitMidi || now - lastEmitT > 800) && (now - lastEmitT > 220 || midi !== lastEmitMidi);
    if(ok){
      wasSilent = false; lastEmitMidi = midi; lastEmitT = now;
      triggerNote(midi, true);
    }
  }
}

if($('#micBtn')) $('#micBtn').addEventListener('click', function(){ playUiSound('click'); micActive ? stopMic() : startMic(); });
if($('#srcMic')) $('#srcMic').addEventListener('click', function(){
  playUiSound('click');
  $('#micPanel').hidden = false;
  $('#srcMic').classList.add('active');
  $('#srcPiano').classList.remove('active');
});
if($('#srcPiano')) $('#srcPiano').addEventListener('click', function(){
  playUiSound('click');
  $('#micPanel').hidden = true;
  $('#srcPiano').classList.add('active');
  $('#srcMic').classList.remove('active');
  stopMic();
});

/* ============ TECLADO FÍSICO PC ============ */
window.addEventListener('keydown', function(e){
  if(e.repeat) return;
  if(e.key === 'Escape'){
    if($('#modal') && !$('#modal').hidden){ closeToPath(); }
    else if(practice.active){ exitPractice(); }
    return;
  }
  var k = e.key.toLowerCase();
  if(k in KEYMAP) triggerNote(KEYMAP[k], false);
});
window.addEventListener('blur', function(){
  for(var k in keyEls) keyEls[k].classList.remove('down');
});

/* ============ PESTAÑAS ============ */
function setMode(mode){
  $('#tabLearn').classList.toggle('active', mode === 'learn');
  $('#tabFree').classList.toggle('active', mode === 'free');
  $('#learnPanel').hidden = (mode !== 'learn');
  $('#freePanel').hidden = (mode !== 'free');
  if(mode === 'free') exitPractice();
}
if($('#tabLearn')) $('#tabLearn').addEventListener('click', function(){ playUiSound('click'); if(practice.active) exitPractice(); setMode('learn'); });
if($('#tabFree')) $('#tabFree').addEventListener('click', function(){ playUiSound('click'); setMode('free'); });

/* ============ PARTITURA SVG EN VIVO ============ */
function diatonic(m){
  var pc = ((m % 12) + 12) % 12, oct = Math.floor(m / 12) - 1;
  var letter = [0, -1, 1, -1, 2, 3, -1, 4, -1, 5, -1, 6][pc];
  return oct * 7 + letter;
}
function renderStaff(container, note, showName){
  if(!container || !note) return;
  var steps = diatonic(note.midi) - 30;
  var y = 70 - steps * 5, x = 150, dur = note.dur;
  var hollow = (dur >= 2), hasStem = (dur < 4), isEighth = (dur < 1);
  var sharp = midiToPC(note.midi).indexOf('#') >= 0;
  var s = '<svg viewBox="0 0 260 118" width="250" height="114">';
  s += '<defs><linearGradient id="cGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#ffb547"/><stop offset="100%" stop-color="#ff8038"/></linearGradient></defs>';
  for(var i = 0; i < 5; i++) s += '<line x1="12" y1="' + (30 + i * 10) + '" x2="248" y2="' + (30 + i * 10) + '" stroke="#6a7089" stroke-width="1.4"/>';
  s += '<text x="14" y="80" font-size="60" fill="#cdd2e4" font-family="serif">𝄞</text>';

  // Cursor resplandeciente de partitura viva
  s += '<line class="staffCursor" x1="' + x + '" y1="18" x2="' + x + '" y2="92" stroke="url(#cGrad)" stroke-dasharray="4 2"/>';

  if(note.midi <= 60) s += '<line x1="' + (x - 13) + '" y1="80" x2="' + (x + 13) + '" y2="80" stroke="#6a7089" stroke-width="1.4"/>';
  if(sharp) s += '<text x="' + (x - 19) + '" y="' + (y + 6) + '" font-size="17" fill="#ffb547" font-family="serif">♯</text>';
  if(hasStem) s += '<line x1="' + (x + 7) + '" y1="' + (y - 2) + '" x2="' + (x + 7) + '" y2="' + (y - 40) + '" stroke="#ffb547" stroke-width="2.4"/>';
  if(isEighth) s += '<path d="M ' + (x + 7) + ' ' + (y - 40) + ' q 12 6 7 22" stroke="#ffb547" stroke-width="2.8" fill="none"/>';
  s += '<ellipse cx="' + x + '" cy="' + y + '" rx="8" ry="6" transform="rotate(-18 ' + x + ' ' + y + ')" ' + (hollow ? 'fill="none" stroke="#ffb547" stroke-width="2.5"' : 'fill="#ffb547"') + ' style="filter:drop-shadow(0 0 8px rgba(255,181,71,0.9))"/>';
  if(showName){
    var pc2 = midiToPC(note.midi);
    var label = settings.sys === 'solfege' ? SOL[pc2] : pc2;
    s += '<text x="' + x + '" y="112" text-anchor="middle" fill="#ffb547" font-size="14" font-family="Outfit,sans-serif" font-weight="800">' + label + midiToOct(note.midi) + '</text>';
  }
  s += '</svg>';
  container.innerHTML = s;
}

/* ============ MANOS ANATÓMICAS SVG ============ */
function handSVG(prefix, mirror){
  var F = [{x:6,w:19,y:52,h:46},{x:30,w:17,y:24,h:70},{x:52,w:17,y:14,h:80},{x:74,w:17,y:22,h:72},{x:96,w:16,y:38,h:56}];
  var s = '<svg viewBox="0 0 140 132" width="112" class="' + (mirror ? 'lhsvg' : '') + '">';
  s += '<rect x="26" y="88" width="92" height="34" rx="14" fill="#24293e"/>';
  var i, f, x;
  for(i = 0; i < 5; i++){
    f = F[i];
    x = mirror ? (140 - f.x - f.w) : f.x;
    s += '<rect class="hg" id="' + prefix + 'g' + (i + 1) + '" x="' + x + '" y="' + f.y + '" width="' + f.w + '" height="' + f.h + '" rx="8"/>';
  }
  for(i = 0; i < 5; i++){
    f = F[i];
    var cx = mirror ? (140 - f.x - f.w / 2) : (f.x + f.w / 2);
    s += '<text class="hnum" id="' + prefix + 'n' + (i + 1) + '" x="' + cx + '" y="115">' + (i + 1) + '</text>';
  }
  s += '</svg>';
  return s;
}
function handWrap(prefix, label, mirror){
  var d = document.createElement('div');
  d.className = 'handUnit';
  d.id = (prefix === 'hgL') ? 'huL' : 'huR';
  d.innerHTML = '<div class="handLbl">' + label + '</div>' + handSVG(prefix, mirror);
  return d;
}
var handState = { both: false, leftOnly: false };
function setupHands(lv){
  var box = $('#handsBox'); if(!box) return; box.innerHTML = '';
  var both = !!lv.hands, leftOnly = (!both) && lv.handAll === 'I';
  if(both){
    box.appendChild(handWrap('hgL', '🫲 Mano Izquierda', true));
    box.appendChild(handWrap('hgR', '🖐 Mano Derecha', false));
  }else if(leftOnly){
    box.appendChild(handWrap('hgL', '🫲 Mano Izquierda', true));
  }else{
    box.appendChild(handWrap('hgR', '🖐 Mano Derecha', false));
  }
  handState = { both: both, leftOnly: leftOnly };
}
function clearHandHighlights(){
  ['hgL', 'hgR'].forEach(function(p){
    for(var i = 1; i <= 5; i++){
      var g = document.getElementById(p + 'g' + i), t = document.getElementById(p + 'n' + i);
      if(g) g.classList.remove('on');
      if(t) t.classList.remove('on');
    }
  });
}
function setHandFinger(n, which){
  clearHandHighlights();
  var pref;
  if(handState.both) pref = (which === 'I') ? 'hgL' : 'hgR';
  else pref = handState.leftOnly ? 'hgL' : 'hgR';
  if(n){
    var g = document.getElementById(pref + 'g' + n), t = document.getElementById(pref + 'n' + n);
    if(g) g.classList.add('on');
    if(t) t.classList.add('on');
  }
  var ht = $('#handTxt');
  if(ht) ht.textContent = n ? ('Dedo ' + n + ' · ' + FING_NAMES[n] + (handState.both ? (which === 'I' ? ' · Mano Izquierda' : ' · Mano Derecha') : '')) : 'Observa la postura';
}
function positionFingerChip(el, f){
  var pianoWrap = $('#pianoWrap'); if(!pianoWrap) return;
  var r = el.getBoundingClientRect(), w = pianoWrap.getBoundingClientRect();
  var chip = $('#fingerChip'); if(!chip) return;
  chip.textContent = f;
  chip.style.left = (r.left + r.width / 2 - w.left) + 'px';
  chip.style.top = (r.top - w.top + 18) + 'px';
  chip.style.opacity = '1';
}
function hideFingerChip(){ var c = $('#fingerChip'); if(c) c.style.opacity = '0'; }

/* ============ RUTA PEDAGÓGICA GAMIFICADA ============ */
function getPath(){ try{ return JSON.parse(storeGet('pf_path') || '{}'); }catch(e){ return {}; } }
function stageLocked(s, prog){
  if(s === 1) return false;
  return !stageDoneIn(prog, s - 1);
}
function nextLevelFor(prog){
  for(var i = 0; i < LEVELS.length; i++){
    var lv = LEVELS[i];
    if((prog[lv.id] || 0) > 0) continue;
    if(stageLocked(lv.stage, prog)) continue;
    return lv;
  }
  return null;
}
function continueLevel(prog){
  var lastId = parseInt(storeGet('pf_last') || '0', 10);
  var last = null;
  if(lastId) last = LEVELS.filter(function(l){ return l.id === lastId; })[0] || null;
  if(last && (prog[last.id] || 0) === 0 && !stageLocked(last.stage, prog)) return last;
  return nextLevelFor(prog);
}

function renderPath(){
  var box = $('#pathBox'); if(!box) return; box.innerHTML = '';
  var prog = getPath();
  var st = courseStats(prog);
  var cont = continueLevel(prog);
  if(cont){
    var bar = document.createElement('div');
    bar.className = 'continueBar';
    bar.innerHTML = '👉 <b>Continúa donde lo dejaste, Mateo:</b>&nbsp; ' + cont.emoji + ' Nivel ' + cont.id + ' · ' + cont.title;
    var cb = document.createElement('button'); cb.className = 'btn small'; cb.type = 'button'; cb.textContent = '▶ Continuar';
    cb.addEventListener('click', (function(l){ return function(){ playUiSound('click'); startPractice(l); }; })(cont));
    bar.appendChild(cb);
    box.appendChild(bar);
  }
  var foundNext = false;
  STAGES.forEach(function(sg){
    var lvls = LEVELS.filter(function(l){ return l.stage === sg.id; });
    var done = stageDoneIn(prog, sg.id);
    var locked = stageLocked(sg.id, prog);
    
    var mapContainer = document.createElement('div');
    mapContainer.className = 'mapStageContainer';

    var head = document.createElement('div');
    head.className = 'stageHead' + (sg.id === 1 ? ' s1' : '');
    var stState;
    if(done) stState = '<span class="stageState ok">✅ Etapa Completada</span>';
    else if(locked) stState = '<span class="stageState">🔒 Completa Etapa ' + (sg.id - 1) + '</span>';
    else stState = '<span class="stageState">En progreso…</span>';
    head.innerHTML = '<div class="stageEmoji">' + sg.emoji + '</div>' +
      '<div><div class="stageTitle">' + sg.title + '</div><div class="stageDesc">' + sg.desc + '</div></div>' + stState;
    mapContainer.appendChild(head);

    var grid = document.createElement('div');
    grid.className = 'mapGrid';

    lvls.forEach(function(lv){
      var gi = LEVELS.indexOf(lv);
      var stars = prog[lv.id] || 0;
      var unlocked = (!locked) && (gi === 0 || (prog[LEVELS[gi - 1].id] || 0) > 0);
      var isNext = unlocked && stars === 0 && !foundNext;
      if(isNext) foundNext = true;

      var nodeItem = document.createElement('div');
      nodeItem.className = 'nodeItem';

      var nodeBtn = document.createElement('button');
      nodeBtn.className = 'nodeBtn' + (unlocked ? '' : ' locked') + (stars > 0 ? ' done' : '') + (isNext ? ' current' : '');
      nodeBtn.type = 'button';
      nodeBtn.innerHTML = stars > 0 ? '✓' : (unlocked ? (isNext ? '▶' : lv.id) : '🔒');

      if(unlocked){
        nodeBtn.addEventListener('click', (function(l){ return function(){ playUiSound('click'); startPractice(l); }; })(lv));
      }

      var title = document.createElement('div');
      title.className = 'nodeTitle';
      title.textContent = lv.emoji + ' ' + lv.title;

      var starsDiv = document.createElement('div');
      starsDiv.className = 'nodeStars';
      starsDiv.textContent = stars > 0 ? '★'.repeat(stars) + '☆'.repeat(3 - stars) : (isNext ? '¡Tocar!' : '');

      nodeItem.appendChild(nodeBtn);
      nodeItem.appendChild(title);
      nodeItem.appendChild(starsDiv);
      grid.appendChild(nodeItem);
    });

    mapContainer.appendChild(grid);
    box.appendChild(mapContainer);
  });

  if($('#courseFill')) $('#courseFill').style.width = (st.done / LEVELS.length * 100) + '%';
  if($('#courseTxt')) $('#courseTxt').textContent = st.done + '/' + LEVELS.length + ' niveles';
  if($('#headerStars')) $('#headerStars').innerHTML = '⭐ ' + st.stars + ' Estrellas';
  renderBadges();
  try{ renderKidPathMini(); }catch(e){}
}

// Render compact horizontal path for Kid Mode
function renderKidPathMini(){
  var box = $('#kidPathMini'); if(!box) return;
  box.innerHTML = '';
  var prog = getPath();
  var foundNext = false;
  // gather all levels flat
  LEVELS.forEach(function(lv, gi){
    var stars = prog[lv.id] || 0;
    var unlocked = (gi === 0) || ((prog[LEVELS[gi - 1].id] || 0) > 0);
    var isNext = unlocked && stars === 0 && !foundNext;
    if(isNext) foundNext = true;

    var pill = document.createElement('div');
    pill.className = 'kid-pill' + (unlocked ? '' : ' locked') + (isNext ? ' current' : '');
    pill.setAttribute('data-level-id', String(lv.id));
    pill.innerHTML = '<span class="pill-emoji">' + lv.emoji + '</span><span class="pill-title">' + lv.title + '</span>';
    if(unlocked){
      pill.addEventListener('click', function(){ playUiSound('click'); startPractice(lv); });
    }
    box.appendChild(pill);
  });

  // controls: continue and open full map
  var controls = document.createElement('div'); controls.className = 'kid-controls';
  var cont = continueLevel(prog);
  var cb = document.createElement('button'); cb.className = 'btn small'; cb.type = 'button'; cb.textContent = cont ? ('▶ Continuar ' + cont.title) : '▶ Continuar';
  cb.addEventListener('click', function(){ if(cont) { playUiSound('click'); startPractice(cont); } });
  controls.appendChild(cb);
  var openFull = document.createElement('button'); openFull.className = 'btn small ghost'; openFull.type = 'button'; openFull.textContent = 'Mapa';
  openFull.addEventListener('click', function(){ playUiSound('click'); document.body.classList.remove('kid-mode'); storeSet('pf_kid_mode','0'); document.getElementById('kidModeBtn').textContent = '🧸 Modo Niño'; $('#kidPathMini').hidden = true; $('#pathView').hidden = false; renderPath(); });
  controls.appendChild(openFull);
  box.appendChild(controls);

  // visibility: show only in kid-mode
  if(document.body.classList.contains('kid-mode')){ box.hidden = false; $('#pathView').hidden = true; } else { box.hidden = true; }
}

/* ============ PRÁCTICA Y MODO APRENDIZAJE ============ */
var practice = { active: false, level: null, idx: 0, hits: 0, misses: 0, streak: 0, bestStreak: 0, demo: false, intro: false, lastTouchT: 0 };
var lastHintMidi = null, demoRun = 0;
function needsListenMsg(lv){ return (lv.stage === 1 && lv.id <= 2) || !!lv.song; }

function startPractice(lv){
  setMode('learn');
  demoRun++;
  stopRecorderPlayback();
  hideMsgNow();
  practice = { active: true, level: lv, idx: 0, hits: 0, misses: 0, streak: 0, bestStreak: 0, demo: false, intro: true, lastTouchT: performance.now() };
  storeSet('pf_last', String(lv.id));
  $('#pathView').hidden = true; $('#practice').hidden = false;
  $('#pracName').textContent = lv.emoji + ' ' + lv.title;
  $('#pracLvl').textContent = 'Nivel ' + lv.id + ' de ' + LEVELS.length + ' · ' + STAGES[lv.stage - 1].title;
  $('#demoBtn').textContent = '▶ Escuchar';
  if($('#skipIntroBtn')) $('#skipIntroBtn').hidden = false;
  
  if(lv.lesson){ $('#lessonBox').hidden = false; $('#lessonBox').innerHTML = '💡 ' + lv.lesson; }
  else $('#lessonBox').hidden = true;
  var ui = lv.ui || {};
  $('#teachRow').hidden = !(ui.hand || ui.score);
  $('#handCard').hidden = !ui.hand;
  $('#staffCard').hidden = !ui.score;
  if(ui.hand) setupHands(lv);
  if(ui.score) renderStaff($('#staffBox'), lv.notes[0], settings.staffNames);
  updatePracticeUI();
  startMetronome();
  setAvatarState('idle', 'Preparando ' + lv.title + '… 🎶', 0);
  runIntro();
}

function skipIntro(){
  if(!practice.active || !practice.intro) return;
  playUiSound('click');
  hideMsgNow();
  demoRun++;
  practice.demo = false;
  endIntro();
  setAvatarState('idle', '¡A tocar en el piano, Mateo! 🎹', 2000);
  toast('⏭ Intro saltada. ¡A tocar en el piano, Mateo!');
}
if($('#skipIntroBtn')) $('#skipIntroBtn').addEventListener('click', skipIntro);

function endIntro(){
  practice.intro = false;
  if($('#skipIntroBtn')) $('#skipIntroBtn').hidden = true;
  $('#demoBtn').disabled = false;
  $('#demoBtn').textContent = '▶ Escuchar';
  if(practice.active) {
    practice.lastTouchT = performance.now();
    setHint(practice.level.notes[practice.idx]);
    setAvatarState('idle', '¡Tu turno, Mateo! Toca la primera nota 🎹', 3000);
  }
}

var metroInterval = null, beatCount = 0;
function startMetronome(){
  stopMetronome();
  var ms = 60000 / practice.level.bpm;
  beatCount = 0;
  metroInterval = setInterval(function(){
    var m = $('#metronome'); if(!m) return;
    m.classList.remove('beat', 'beat1');
    void m.offsetWidth;
    m.classList.add(beatCount === 0 ? 'beat1' : 'beat');
    beatCount = (beatCount + 1) % 4;
  }, ms);
}
function stopMetronome(){ clearInterval(metroInterval); }

function runIntro(){
  practice.intro = true;
  $('#demoBtn').disabled = true;
  $('#demoBtn').textContent = '🎧 Preparando…';
  setAvatarState('listen', '🧘 Escuchando la melodía de muestra…', 3800);
  showMsg('🧘 Antes de tocar, Mateo:<br>' + rnd(PRE_TIPS), 3800, function(){
    if(!practice.active) return;
    var play = function(){
      $('#demoBtn').textContent = '🎧 Escuchando…';
      playDemo(function(){
        if(!practice.active) return;
        showMsg('🎹 ¡Ahora te toca a ti, Mateo!', 3000, function(){ endIntro(); });
      });
    };
    if(needsListenMsg(practice.level)){
      showMsg('🎧 ¡Vamos a escuchar y luego a practicar, Mateo!', 3500, play);
    }else{
      play();
    }
  });
}

function exitPractice(){
  demoRun++;
  hideMsgNow();
  practice.active = false; practice.demo = false; practice.intro = false;
  stopMetronome();
  if($('#skipIntroBtn')) $('#skipIntroBtn').hidden = true;
  $('#demoBtn').textContent = '▶ Escuchar';
  $('#demoBtn').disabled = false;
  hideArrow(); clearHints(); hideFingerChip();
  $('#practice').hidden = true; $('#pathView').hidden = false;
  setAvatarState('idle', '¡Explora el mapa y sigue avanzando! 🌟', 0);
  renderPath();
}
if($('#backBtn')) $('#backBtn').addEventListener('click', function(){ playUiSound('click'); exitPractice(); });

function currentHand(){
  var lv = practice.level;
  if(lv.hands) return lv.hands[practice.idx];
  return lv.handAll || null;
}

function setHint(note){
  clearHints(); clearErrors(); lastHintMidi = note.midi;
  var lv = practice.level, ui = lv.ui || {};
  var el = keyEls[note.midi]; if(el) el.classList.add('hint');
  var pc = midiToPC(note.midi), nameEl = $('#noteName');
  if(nameEl){
    nameEl.textContent = settings.sys === 'solfege' ? SOL[pc] : pc;
    nameEl.classList.remove('pop'); void nameEl.offsetWidth; nameEl.classList.add('pop');
  }
  if(el) positionArrow(el); else hideArrow();
  // animate neon hint for visual clarity
  try{ animateNeonHint(note.midi); }catch(e){}
  if(ui.score) renderStaff($('#staffBox'), note, settings.staffNames);
  var fing = (lv.fing && lv.fing[practice.idx]) || 0;
  var which = currentHand();
  if(ui.hand) setHandFinger(fing, which);
  if(ui.hand && fing && el) positionFingerChip(el, fing); else hideFingerChip();
  var tag = $('#handTag');
  if(tag){
    if(which){
      tag.hidden = false;
      tag.className = which === 'I' ? 'ih' : 'dh';
      tag.textContent = which === 'I' ? '🫲 Mano Izquierda' : '🖐 Mano Derecha';
    }else tag.hidden = true;
  }
}

// Load hand guide image for a level if available in assets/hand_guides/
function loadHandGuideForLevel(lv){
  var card = document.getElementById('handCard'); if(!card) return;
  var candidates = [];
  // if level defines a specific guide filename
  if(lv && lv.ui && lv.ui.handGuide){ candidates.push('assets/hand_guides/' + lv.ui.handGuide); candidates.push('www/assets/hand_guides/' + lv.ui.handGuide); }
  // common filenames from prompts
  var common = [
    'hand_finger_1_to_5_right.png','hand_finger_1_to_5_left.png','hand_posture_thumb_under.png',
    'hand_relaxed_wrist_side.png','hand_curve_tip_contact.png','hand_thumb_below.png','hand_two_hands_small_span.png'
  ];
  common.forEach(function(n){ candidates.push('assets/hand_guides/' + n); candidates.push('www/assets/hand_guides/' + n); });

  // probe sequentially and show first that exists
  (function tryNext(i){ if(i >= candidates.length){ /* none found */ return; }
    var url = candidates[i]; var img = new Image(); img.src = url + '?v=1';
    img.onload = function(){ card.innerHTML = ''; img.className = 'handGuideImg'; img.style.maxWidth='100%'; img.style.borderRadius='10px'; card.appendChild(img); };
    img.onerror = function(){ tryNext(i+1); };
  })(0);
}

// When entering practice, try to load guide
var _oldStartPractice = startPractice;
startPractice = function(lv){ _oldStartPractice(lv); try{ loadHandGuideForLevel(lv); }catch(e){} };

// Neon indicator above current hint key — animated for better feedback
function animateNeonHint(midi){
  try{
    var wrap = document.getElementById('pianoWrap'); if(!wrap) return;
    var neon = document.getElementById('neonHint');
    if(!neon){ neon = document.createElement('div'); neon.id = 'neonHint'; neon.className = 'neonHint'; neon.style.position = 'absolute'; wrap.appendChild(neon); }
    var el = keyEls[midi];
    if(!el){ try{ clearTimeout(neon._h); neon.style.opacity = '0'; }catch(e){} return; }
    var r = el.getBoundingClientRect(), w = wrap.getBoundingClientRect();
    // compute centered coordinates and apply directly to the neon element
    var leftPx = Math.round(r.left + r.width/2 - w.left - (neon.offsetWidth ? neon.offsetWidth/2 : 24));
    var topPx = Math.round(r.top - w.top - 18);
    neon.style.left = leftPx + 'px';
    neon.style.top = topPx + 'px';
    neon.style.opacity = '1';
    neon.classList.remove('neonPulse'); void neon.offsetWidth; neon.classList.add('neonPulse');
    try{ clearTimeout(neon._h); }catch(e){}
    neon._h = setTimeout(function(){ try{ neon.style.opacity = '0'; }catch(e){} }, 1200);
  }catch(e){ }
}

function refreshTeach(){
  if(practice.active && practice.level.ui && practice.level.ui.score){
    var n = practice.level.notes[practice.idx];
    if(n) renderStaff($('#staffBox'), n, settings.staffNames);
  }
}

function clearHints(){ for(var k in keyEls) keyEls[k].classList.remove('hint'); }
function clearErrors(){ for(var k in keyEls) keyEls[k].classList.remove('err'); }
function positionArrow(el){
  var pianoWrap = $('#pianoWrap'); if(!pianoWrap) return;
  var r = el.getBoundingClientRect(), w = pianoWrap.getBoundingClientRect();
  var a = $('#hintArrow'); if(!a) return;
  a.style.opacity = '1'; a.style.left = (r.left + r.width / 2 - w.left) + 'px';
}
function hideArrow(){ var a = $('#hintArrow'); if(a) a.style.opacity = '0'; lastHintMidi = null; }
window.addEventListener('resize', function(){
  if(practice.active && lastHintMidi != null && keyEls[lastHintMidi]){
    positionArrow(keyEls[lastHintMidi]);
    var lv = practice.level, fing = (lv.fing && lv.fing[practice.idx]) || 0;
    if(lv.ui && lv.ui.hand && fing) positionFingerChip(keyEls[lastHintMidi], fing);
  }
});

function updatePracticeUI(){
  var total = practice.level.notes.length;
  if($('#progFill')) $('#progFill').style.width = (practice.idx / total * 100) + '%';
  if($('#statProg')) $('#statProg').textContent = practice.idx + '/' + total;
  if($('#statStreak')) $('#statStreak').textContent = practice.streak + (practice.streak >= 5 ? ' 🔥' : '');
  var tries = practice.hits + practice.misses;
  if($('#statAcc')) $('#statAcc').textContent = tries ? Math.round(practice.hits / tries * 100) + '%' : '—';
}

function restartFromStart(){
  practice.intro = true;
  hideArrow(); clearHints(); clearErrors(); hideFingerChip();
  setAvatarState('oops', '¡Volvamos a empezar con calma, tú puedes! 💪', 3200);
  showMsg('💪 Se superó el margen de fallos, Mateo.<br>¡Volvamos a empezar con calma, tú puedes!', 3200, function(){
    if(!practice.active){ practice.intro = false; return; }
    practice.idx = 0; practice.hits = 0; practice.misses = 0; practice.streak = 0;
    updatePracticeUI();
    practice.intro = false;
    practice.lastTouchT = performance.now();
    setHint(practice.level.notes[0]);
  });
}

function judge(m){
  if(!practice.active || practice.demo || practice.intro) return;
  var now = performance.now();
  var expectedNote = practice.level.notes[practice.idx];
  var expectedMidi = expectedNote.midi;
  
  var maxMissesAllowed = Math.max(3, Math.floor(practice.level.notes.length * 0.25));

  if(m === expectedMidi){
    var expectedDurationMs = (expectedNote.dur * 60 / practice.level.bpm) * 1000;
    var deltaMs = now - practice.lastTouchT;
    practice.lastTouchT = now;
    
    if(practice.idx > 0 && Math.abs(deltaMs - expectedDurationMs) < (expectedDurationMs * 0.35)){
      toast('🎵 ¡Ritmo perfecto!');
    }

    practice.hits++; practice.streak++;
    if(practice.streak > practice.bestStreak) practice.bestStreak = practice.streak;
    burst(m, true);
    
    if(practice.streak >= 5){
      setAvatarState('fire', '🔥 ¡Racha de ' + practice.streak + '! ¡Estás en llamas!', 1200);
    } else {
      setAvatarState('happy', '¡Bien tocado! 🎵', 750);
    }

    if(practice.hits > 0 && practice.hits % 8 === 0) toast('🧘 ' + rnd(DURING_TIPS));
    practice.idx++;
    updatePracticeUI();
    if(practice.idx >= practice.level.notes.length) finishPractice();
    else setHint(practice.level.notes[practice.idx]);
  }else{
    if(!settings.waitMode){
      practice.misses++; practice.streak = 0;
    }
    var el = keyEls[m];
    if(el){ el.classList.remove('err'); void el.offsetWidth; el.classList.add('err'); }
    var badge = $('#noteBadge');
    if(badge){ badge.classList.add('bad'); setTimeout(function(){ badge.classList.remove('bad'); }, 350); }
    
    setAvatarState('oops', '¡Casi! Respira y toca con calma 👍', 1400);

    if(!settings.waitMode){
      if(practice.misses >= maxMissesAllowed){ 
        updatePracticeUI(); restartFromStart(); return; 
      } else {
        toast('⚠️ Mateo, llevas ' + practice.misses + ' de ' + maxMissesAllowed + ' fallos permitidos.');
      }
    }
    updatePracticeUI();
  }
}

function finishPractice(){
  practice.active = false; hideArrow(); clearHints(); hideFingerChip();
  clearErrors();
  var tries = practice.hits + practice.misses;
  var acc = tries ? Math.round(practice.hits / tries * 100) : 100;
  var stars = acc >= 92 ? 3 : (acc >= 75 ? 2 : 1);
  var prog = getPath();
  if(stars > (prog[practice.level.id] || 0)) prog[practice.level.id] = stars;
  storeSet('pf_path', JSON.stringify(prog));
  var nowEarned = earnedBadges(prog);
  var prev = [];
  try{ prev = JSON.parse(storeGet('pf_badges') || '[]'); }catch(e){}
  var newOnes = nowEarned.filter(function(id){ return prev.indexOf(id) < 0; });
  storeSet('pf_badges', JSON.stringify(nowEarned));
  
  setAvatarState('victory', '🎉 ¡Nivel completado con maestría! 🏆', 0);

  var rl = $('#rewardLine');
  if(rl){
    rl.innerHTML = '';
    if(newOnes.length){
      rl.hidden = false;
      newOnes.forEach(function(id){
        var b = BADGES.filter(function(x){ return x.id === id; })[0];
        var chip = document.createElement('div'); chip.className = 'rewardChip';
        chip.innerHTML = b.icon + ' ¡Nueva Recompensa: ' + b.name + '!';
        rl.appendChild(chip);
      });
    }else rl.hidden = true;
  }
  var stageNowDone = stageDoneIn(prog, practice.level.stage);
  var cheer = $('#cheerMsg');
  if(cheer){
    if(stars === 3 || practice.level.song || stageNowDone){
      cheer.hidden = false;
      cheer.textContent = '💛 ' + rnd(ENTHUSIASM);
    }else cheer.hidden = true;
  }
  if($('#afterTip')) $('#afterTip').textContent = rnd(POST_TIPS);
  var box = $('#starsBox');
  if(box){
    box.innerHTML = '';
    for(var i = 1; i <= 3; i++){
      var sp = document.createElement('span'); sp.textContent = '★';
      if(i <= stars) sp.classList.add('on');
      box.appendChild(sp);
    }
  }
  if($('#mAcc')) $('#mAcc').textContent = acc + '%';
  if($('#mStreak')) $('#mStreak').textContent = practice.bestStreak;
  if($('#mHits')) $('#mHits').textContent = practice.hits;
  if($('#mMiss')) $('#mMiss').textContent = practice.misses;
  
  var idx = LEVELS.findIndex(function(l){ return l.id === practice.level.id; });
  var nxt = LEVELS[idx + 1] || null;
  var crossed = nxt && nxt.stage > practice.level.stage;
  if($('#modalTitle')){
    if(!nxt) $('#modalTitle').textContent = '🏆 ¡Curso completado, Mateo! ¡Pianista graduado!';
    else if(crossed) $('#modalTitle').textContent = '🎊 ¡' + STAGES[nxt.stage - 1].title + ' desbloqueada!';
    else $('#modalTitle').textContent = '🎉 ¡Nivel completado, Mateo!';
  }
  if($('#nextBtn')){
    $('#nextBtn').textContent = !nxt ? '🎓 Ver mi plan' : (crossed ? ('🚀 ¡A la Etapa ' + nxt.stage + '!') : 'Siguiente nivel ▸');
    $('#nextBtn').onclick = function(){
      playUiSound('click');
      $('#modal').hidden = true;
      if(nxt) startPractice(nxt); else exitPractice();
    };
  }
  if($('#modal')) $('#modal').hidden = false;
  playUiSound('victory');
  launchConfetti();
  if(newOnes.length) setTimeout(function(){ launchConfetti(); }, 600);
}

function closeToPath(){ if($('#modal')) $('#modal').hidden = true; exitPractice(); }
if($('#retryBtn')) $('#retryBtn').addEventListener('click', function(){
  playUiSound('click');
  var lv = practice.level;
  if($('#modal')) $('#modal').hidden = true;
  if(lv) startPractice(lv);
});

/* ============ MODO AUDICIÓN / DEMO ============ */
function playDemo(onDone){
  if(!practice.level) return;
  var my = ++demoRun;
  practice.demo = true;
  $('#demoBtn').textContent = '⏹ Detener';
  clearHints(); hideArrow(); hideFingerChip();
  var mult = parseFloat($('#tempoSel').value) || 1;
  var i = 0;
  function step(){
    if(my !== demoRun) return;
    if(i >= practice.level.notes.length){
      practice.demo = false;
      if(onDone){ onDone(); }
      else{
        $('#demoBtn').textContent = '▶ Escuchar';
        if(practice.active) setHint(practice.level.notes[practice.idx]);
      }
      return;
    }
    var n = practice.level.notes[i++];
    var dur = n.dur * 60 / practice.level.bpm * 1000 / mult;
    triggerNote(n.midi, false, true);
    setTimeout(step, dur * 0.92);
  }
  step();
}
if($('#demoBtn')) $('#demoBtn').addEventListener('click', function(){
  playUiSound('click');
  var self = this;
  if(!practice.level || practice.intro) return;
  if(practice.demo){
    demoRun++; practice.demo = false;
    self.textContent = '▶ Escuchar';
    if(practice.active) setHint(practice.level.notes[practice.idx]);
    return;
  }
  playDemo(null);
});

/* ============ GRABADOR DE PISTAS ============ */
var rec = { state: 'idle', events: [], t0: 0, timer: null, playing: false, timeouts: [] };
function fmt(ms){ var s = Math.floor(ms / 1000); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }
function recordEvent(m){ if(rec.state === 'rec') rec.events.push({ m: m, t: performance.now() - rec.t0 }); }
if($('#recBtn')) $('#recBtn').addEventListener('click', function(){
  playUiSound('click');
  if(rec.playing) return;
  if(rec.state === 'idle'){
    rec.state = 'rec'; rec.events = []; rec.t0 = performance.now();
    this.textContent = '⏹ Detener grabación';
    $('#recStatus').className = 'rec'; $('#recStatus').textContent = 'Grabando… 0:00';
    $('#playRecBtn').disabled = true; $('#clearRecBtn').disabled = true;
    rec.timer = setInterval(function(){ $('#recStatus').textContent = 'Grabando… ' + fmt(performance.now() - rec.t0); }, 250);
  }else{
    rec.state = 'idle'; clearInterval(rec.timer);
    this.textContent = '⏺ Grabar pista';
    $('#recStatus').className = '';
    $('#recStatus').textContent = rec.events.length + ' notas guardadas ✔';
    $('#playRecBtn').disabled = !rec.events.length; $('#clearRecBtn').disabled = !rec.events.length;
  }
});

function stopRecorderPlayback(){
  if(!rec.playing) return;
  rec.timeouts.forEach(clearTimeout); rec.timeouts = [];
  rec.playing = false; $('#recBtn').disabled = false; $('#playRecBtn').textContent = '▶ Reproducir';
}
if($('#playRecBtn')) $('#playRecBtn').addEventListener('click', function(){
  playUiSound('click');
  if(rec.playing){ stopRecorderPlayback(); return; }
  if(!rec.events.length) return;
  rec.playing = true; rec.timeouts = [];
  this.textContent = '⏹ Detener'; $('#recBtn').disabled = true;
  rec.events.forEach(function(e){
    rec.timeouts.push(setTimeout(function(){ triggerNote(e.m, false, true); }, e.t));
  });
  var end = rec.events[rec.events.length - 1].t + 800;
  rec.timeouts.push(setTimeout(function(){
    rec.playing = false; $('#recBtn').disabled = false; $('#playRecBtn').textContent = '▶ Reproducir';
  }, end));
});
if($('#clearRecBtn')) $('#clearRecBtn').addEventListener('click', function(){
  playUiSound('click');
  rec.events = [];
  $('#playRecBtn').disabled = true; $('#clearRecBtn').disabled = true;
  $('#recStatus').textContent = 'Listo para grabar';
});

/* ============ ESTADÍSTICAS & TIEMPO ============ */
var totalSec = parseInt(storeGet('pf_time') || '0', 10) || 0;
var sessionPracticeSec = 0, notified15 = false;

function getDailyStats(){
  try{ var d = JSON.parse(storeGet('pf_daily')); if(d && d.history) return d; }catch(e){}
  return { history: {}, streak: 0, lastDate: "" };
}
function saveDailyStats(d){ storeSet('pf_daily', JSON.stringify(d)); }

function updateDailyTime(secToAdd){
  var d = getDailyStats();
  var today = new Date();
  var todayStr = new Date(today.getTime() - (today.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
  
  if(d.lastDate !== todayStr){
    if(d.lastDate){
      var last = new Date(d.lastDate);
      var curr = new Date(todayStr);
      var diffDays = Math.round((curr - last) / (1000 * 60 * 60 * 24));
      if(diffDays === 1) d.streak++; 
      else d.streak = 1; 
    } else {
      d.streak = 1;
    }
    d.lastDate = todayStr;
  }
  d.history[todayStr] = (d.history[todayStr] || 0) + secToAdd;
  saveDailyStats(d);
  
  var hs = $('#headerStreak');
  if(hs) hs.innerHTML = '🔥 ' + d.streak + (d.streak === 1 ? ' Día' : ' Días');
  return d;
}

function fmtTotal(sec){
  var m = Math.floor(sec / 60);
  if(m < 60) return m + ' min';
  return Math.floor(m / 60) + ' h ' + (m % 60) + ' min';
}
function paintTime(){ 
  if($('#timeChip')) $('#timeChip').textContent = '⏱ ' + fmtTotal(totalSec); 
  var d = getDailyStats();
  var hs = $('#headerStreak');
  if(hs) hs.innerHTML = '🔥 ' + d.streak + (d.streak === 1 ? ' Día' : ' Días');
}

setInterval(function(){
  if(practice.active){
    sessionPracticeSec++; totalSec++;
    if(totalSec % 10 === 0) storeSet('pf_time', String(totalSec));
    if(totalSec % 10 === 0) updateDailyTime(10);
    if(sessionPracticeSec >= 900 && !notified15){
      notified15 = true;
      showMsg('🌟 ¡Mateo, llevas 15 minutos practicando!<br>Sigues avanzando con maestría. ¡Qué orgullo!', 4200, null);
    }
  }
  paintTime();
}, 1000);

window.addEventListener('beforeunload', function(){
  storeSet('pf_time', String(totalSec));
  if(practice.level) storeSet('pf_last', String(practice.level.id));
  if(sessionPracticeSec % 10 !== 0) updateDailyTime(sessionPracticeSec % 10);
});

/* ============ MODAL ESTADÍSTICAS SEMANALES ============ */
if($('#statsBtn')) $('#statsBtn').addEventListener('click', function(){
  playUiSound('click');
  var d = getDailyStats();
  var today = new Date();
  var todayStr = new Date(today.getTime() - (today.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
  
  if($('#smStreak')) $('#smStreak').textContent = d.streak;
  var todaySec = d.history[todayStr] || 0;
  if($('#smToday')) $('#smToday').textContent = Math.floor(todaySec / 60) + ' min';
  if($('#smTotal')) $('#smTotal').textContent = fmtTotal(totalSec);
  
  var chart = $('#smChart');
  if(chart){
    chart.innerHTML = '';
    var maxSec = 1;
    var days = [];
    for(var i = 6; i >= 0; i--){
      var td = new Date(today.getTime() - (i * 24 * 60 * 60 * 1000));
      var ds = new Date(td.getTime() - (td.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
      var sec = d.history[ds] || 0;
      if(sec > maxSec) maxSec = sec;
      var lbl = ['D', 'L', 'M', 'X', 'J', 'V', 'S'][td.getDay()];
      days.push({ sec: sec, lbl: lbl });
    }
    
    days.forEach(function(day){
      var wrap = document.createElement('div');
      wrap.className = 'chartBarWrap';
      var pct = Math.max(4, (day.sec / maxSec) * 100);
      wrap.innerHTML = '<div class="chartBar" style="height:' + pct + '%" title="' + Math.floor(day.sec / 60) + ' min"></div><div class="chartLbl">' + day.lbl + '</div>';
      chart.appendChild(wrap);
    });
  }
  if($('#statsModal')) $('#statsModal').hidden = false;
});
if($('#closeStatsBtn')) $('#closeStatsBtn').addEventListener('click', function(){ playUiSound('click'); if($('#statsModal')) $('#statsModal').hidden = true; });

/* ============ CONFETI ============ */
function launchConfetti(){
  var c = $('#confetti'); if(!c) return;
  var colors = ['#ffb547', '#8b6cff', '#3ddc84', '#ff4d6d', '#00e5ff', '#ffffff'];
  for(var i = 0; i < 95; i++){
    var d = document.createElement('i');
    d.style.left = Math.random() * 100 + 'vw';
    d.style.background = colors[i % colors.length];
    var sz = (7 + Math.random() * 7) + 'px';
    d.style.width = sz; d.style.height = sz;
    d.style.animationDelay = (Math.random() * 0.5) + 's';
    d.style.animationDuration = (2.2 + Math.random() * 1.8) + 's';
    c.appendChild(d);
    (function(el){ setTimeout(function(){ el.remove(); }, 5000); })(d);
  }
}

/* ============ CONTROLES DE CONFIGURACIÓN ============ */
if($('#vol')) $('#vol').addEventListener('input', function(){
  settings.vol = this.value / 100;
  if(master) master.gain.value = settings.vol;
  saveSettings();
});
if($('#sysSel')) $('#sysSel').addEventListener('change', function(){
  settings.sys = this.value; refreshLabels(); saveSettings(); refreshTeach();
});
if($('#tglNames')) $('#tglNames').addEventListener('change', function(){ settings.names = this.checked; refreshLabels(); saveSettings(); });
if($('#tglHints')) $('#tglHints').addEventListener('change', function(){ settings.hints = this.checked; refreshLabels(); saveSettings(); });
if($('#tglStaffNames')) $('#tglStaffNames').addEventListener('change', function(){ settings.staffNames = this.checked; saveSettings(); refreshTeach(); });
if($('#tglWaitMode')) $('#tglWaitMode').addEventListener('change', function(){ settings.waitMode = this.checked; saveSettings(); });
if($('#tglSynthesia')) $('#tglSynthesia').addEventListener('change', function(){
  settings.synthesia = this.checked; saveSettings();
  if($('#fallingCanvas')) $('#fallingCanvas').hidden = !settings.synthesia;
  if(settings.synthesia) requestAnimationFrame(drawSynthesia);
});

/* ============ MOTOR SYNTHESIA NEÓN ============ */
var synthCanvas = $('#fallingCanvas'), synthCtx = synthCanvas ? synthCanvas.getContext('2d') : null;
var animY = 0;
function drawSynthesia(){
  if(!settings.synthesia || !practice.active || !synthCtx) return;
  requestAnimationFrame(drawSynthesia);
  var w = synthCanvas.width = synthCanvas.offsetWidth;
  var h = synthCanvas.height = synthCanvas.offsetHeight;
  synthCtx.clearRect(0, 0, w, h);
  
  var targetY = 0;
  var pxPerBeat = 65;
  
  for(var i = 0; i < practice.level.notes.length; i++){
    if(i < practice.idx) targetY += practice.level.notes[i].dur * pxPerBeat;
  }
  
  animY += (targetY - animY) * 0.15;
  var pianoW = $('#piano').offsetWidth;
  var scaleX = w / pianoW;
  
  var accY = -animY;
  for(var j = 0; j < practice.level.notes.length; j++){
    var n = practice.level.notes[j];
    var hBlock = n.dur * pxPerBeat;
    
    if(accY + hBlock > 0 && accY < h){
      var el = keyEls[n.midi];
      if(el){
        var rect = el.getBoundingClientRect();
        var pianoRect = $('#piano').getBoundingClientRect();
        var left = (rect.left - pianoRect.left) * scaleX;
        var bWidth = rect.width * scaleX * 0.82;
        var drawY = h - (accY + hBlock) - 10;
        
        synthCtx.fillStyle = (j === practice.idx) ? '#3ddc84' : (j < practice.idx ? '#586078' : '#ffb547');
        synthCtx.shadowColor = (j === practice.idx) ? 'rgba(61, 220, 132, 0.9)' : 'rgba(255, 181, 71, 0.7)';
        synthCtx.shadowBlur = (j === practice.idx) ? 14 : 8;
        
        synthCtx.beginPath();
        if(synthCtx.roundRect){
          synthCtx.roundRect(left + rect.width * scaleX * 0.09, drawY, bWidth, Math.max(12, hBlock - 2), 6);
        }else{
          synthCtx.rect(left + rect.width * scaleX * 0.09, drawY, bWidth, Math.max(12, hBlock - 2));
        }
        synthCtx.fill();
        synthCtx.shadowBlur = 0;
      }
    }
    accY += hBlock;
  }
}

/* ============ PWA & INSTALACIÓN ============ */
if('serviceWorker' in navigator){
  window.addEventListener('load', function(){
    navigator.serviceWorker.register('sw.js').catch(function(){});
  });
}
var deferredPrompt = null;
window.addEventListener('beforeinstallprompt', function(e){
  e.preventDefault();
  deferredPrompt = e;
  var b = document.getElementById('installBtn');
  if(b) b.hidden = false;
});
if(document.getElementById('installBtn')){
  document.getElementById('installBtn').addEventListener('click', function(){
    var b = this;
    if(!deferredPrompt) return;
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(function(){ deferredPrompt = null; b.hidden = true; });
  });
}

/* ============ INICIALIZACIÓN DE LA APLICACIÓN ============ */
if($('#vol')) $('#vol').value = Math.round(settings.vol * 100);
if($('#sysSel')) $('#sysSel').value = settings.sys;
if($('#tglNames')) $('#tglNames').checked = settings.names;
if($('#tglHints')) $('#tglHints').checked = settings.hints;
if($('#tglStaffNames')) $('#tglStaffNames').checked = settings.staffNames;
var twm = $('#tglWaitMode'); if(twm) twm.checked = settings.waitMode;
var tsy = $('#tglSynthesia'); if(tsy) tsy.checked = settings.synthesia;
if(settings.synthesia && $('#fallingCanvas')){
  $('#fallingCanvas').hidden = false;
  requestAnimationFrame(drawSynthesia);
}
refreshLabels();
renderPath();
paintTime();
setAvatarState('idle', '¡Hola, Mateo! Elige una lección para comenzar 🌟', 0);

// Kid Mode toggle: enlarge keys, simplify UI
try{
  var kidBtn = document.getElementById('kidModeBtn');
  var _kidMode = storeGet('pf_kid_mode') === '1';
  if(_kidMode) document.body.classList.add('kid-mode');
  if(kidBtn){
    kidBtn.textContent = _kidMode ? '🧸 Modo Niño ✓' : '🧸 Modo Niño';
    kidBtn.addEventListener('click', function(){
      _kidMode = !_kidMode;
      if(_kidMode) document.body.classList.add('kid-mode'); else document.body.classList.remove('kid-mode');
      storeSet('pf_kid_mode', _kidMode ? '1' : '0');
      kidBtn.textContent = _kidMode ? '🧸 Modo Niño ✓' : '🧸 Modo Niño';
      toast(_kidMode ? 'Modo Niño activado' : 'Modo Niño desactivado');
      // when toggling kid-mode, update condensed view immediately
      try{ renderKidPathMini(); }catch(e){}
      try{ rebuildPiano(); }catch(e){}
      // ensure piano/path visibility toggled
      try{
        var kp = document.getElementById('kidPathMini');
        if(document.body.classList.contains('kid-mode')){ if(kp) kp.hidden = false; if($('#pathView')) $('#pathView').hidden = true; }
        else { if(kp) kp.hidden = true; if($('#pathView')) $('#pathView').hidden = false; }
      }catch(e){}
    });
  }
}catch(e){ console.warn('Kid mode init error', e); }

// If kid mode is active, add a persistent mic toggle in the header for easy access
try{
  function ensureKidMicButton(enabled){
    var header = document.querySelector('header .headerActions'); if(!header) return;
    var existing = document.getElementById('kidMicBtn');
    if(enabled){
      if(existing) return;
      var b = document.createElement('button'); b.id = 'kidMicBtn'; b.type = 'button'; b.className = 'btn small ghost'; b.textContent = micActive ? '🎤 Mic On' : '🎤 Mic';
      b.addEventListener('click', function(){ if(micActive) stopMic(); else startMic(); b.textContent = micActive ? '🎤 Mic On' : '🎤 Mic'; });
      header.appendChild(b);
    }else{
      if(existing) existing.remove();
    }
  }
  // initial create if kid-mode active now
  ensureKidMicButton(document.body.classList.contains('kid-mode'));
  // watch for toggles on the kid button to add/remove mic btn
  if(document.getElementById('kidModeBtn')){
    document.getElementById('kidModeBtn').addEventListener('click', function(){
      setTimeout(function(){ ensureKidMicButton(document.body.classList.contains('kid-mode')); }, 60);
    });
  }
  // update label when mic state changes
  var _oldStart = startMic; var _oldStop = stopMic;
  startMic = function(){ _oldStart(); setTimeout(function(){ var b = document.getElementById('kidMicBtn'); if(b) b.textContent = micActive ? '🎤 Mic On' : '🎤 Mic'; }, 80); };
  stopMic = function(){ _oldStop(); setTimeout(function(){ var b = document.getElementById('kidMicBtn'); if(b) b.textContent = micActive ? '🎤 Mic On' : '🎤 Mic'; }, 80); };
}catch(e){ console.warn('Kid mic button error', e); }
if($('#headerAvatarBtn')) $('#headerAvatarBtn').addEventListener('click', triggerMateoAvatarGreeting);
if($('#companionBar')) $('#companionBar').addEventListener('click', triggerMateoAvatarGreeting);
if($('#avatar3dStage')) $('#avatar3dStage').addEventListener('click', triggerMateoAvatarGreeting);
if($('#avatarInteractBtn')) $('#avatarInteractBtn').addEventListener('click', triggerMateoAvatarGreeting);
setMode('learn');

/* ============ MOTOR 3D THREE.JS: AVATAR GLB DE MATEO ============ */
var mateo3d = {
  scene: null,
  camera: null,
  renderer: null,
  model: null,
  mixer: null,
  clock: null,
  loaded: false,
  state: 'idle',
  targetRotationY: 0,
  baseY: 0,
  jumpOffset: 0,
  isDragging: false,
  prevMouseX: 0
};

function initMateo3D(){
  var canvas = document.getElementById('avatarCanvas');
  var stage = document.getElementById('avatar3dStage');
  if(!canvas || !stage || typeof THREE === 'undefined') return;

  var width = stage.clientWidth || 170;
  var height = stage.clientHeight || 260;

  mateo3d.clock = new THREE.Clock();
  mateo3d.scene = new THREE.Scene();

  mateo3d.camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
  mateo3d.camera.position.set(0, 0.35, 2.85);

  mateo3d.renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  mateo3d.renderer.setSize(width, height);
  mateo3d.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  // Habilitar sombras y modo PBR
  mateo3d.renderer.shadowMap.enabled = true;
  if(THREE.PCFSoftShadowMap) mateo3d.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  mateo3d.renderer.physicallyCorrectLights = true;
  if(THREE.sRGBEncoding) mateo3d.renderer.outputEncoding = THREE.sRGBEncoding;
  else if(THREE.SRGBColorSpace) mateo3d.renderer.outputColorSpace = THREE.SRGBColorSpace;
  if(THREE.ACESFilmicToneMapping) {
    mateo3d.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    mateo3d.renderer.toneMappingExposure = 1.25;
  }

  // Luces de estudio
  var hemiLight = new THREE.HemisphereLight(0xffffff, 0x333355, 1.4);
  hemiLight.position.set(0, 10, 0);
  mateo3d.scene.add(hemiLight);

  var dirLight = new THREE.DirectionalLight(0xfff5e6, 2.0);
  dirLight.position.set(2.5, 4, 3);
  mateo3d.scene.add(dirLight);

  var rimLight = new THREE.DirectionalLight(0x8b6cff, 1.6);
  rimLight.position.set(-2.5, 2, -2.5);
  mateo3d.scene.add(rimLight);

  var goldAccent = new THREE.PointLight(0xffb547, 1.4, 6);
  goldAccent.position.set(0, -0.8, 1.8);
  mateo3d.scene.add(goldAccent);

  // Pedestal receptor de sombra
  var pedestal = new THREE.Mesh(
    new THREE.CircleGeometry(1.1, 48),
    new THREE.ShadowMaterial({ opacity: 0.45 })
  );
  pedestal.rotation.x = -Math.PI / 2;
  pedestal.position.y = -0.22;
  pedestal.receiveShadow = true;
  mateo3d.scene.add(pedestal);

  // PMREM + HDR environment (si RGBELoader está disponible)
  try{
    if(typeof THREE.RGBELoader !== 'undefined'){
      var pmrem = new THREE.PMREMGenerator(mateo3d.renderer);
      pmrem.compileEquirectangularShader();
      var rgbeLoader = new THREE.RGBELoader();
      rgbeLoader.setDataType(THREE.UnsignedByteType);
      rgbeLoader.load('https://rawcdn.githack.com/mrdoob/three.js/dev/examples/textures/equirectangular/venice_sunset_1k.hdr', function(tex){
        var envMap = pmrem.fromEquirectangular(tex).texture;
        mateo3d.scene.environment = envMap;
        mateo3d.scene.background = null;
        tex.dispose(); pmrem.dispose();
      }, undefined, function(err){
        console.warn('No se pudo cargar HDR para environment:', err);
      });
    }
  }catch(e){ console.warn('PMREM/RGBELoader no disponible:', e); }

  // Cargar GLB generado por Tripo3D
  if(typeof THREE.GLTFLoader !== 'undefined'){
    var hint = document.getElementById('avatarLoadingHint');
    if(hint) hint.hidden = false;

    var loader = new THREE.GLTFLoader();
    // Si DRACOLoader está disponible, configurarlo para modelos comprimidos
    var dracoLoaderRef = null;
    if(typeof THREE.DRACOLoader !== 'undefined' && THREE.DRACOLoader){
      try{
        dracoLoaderRef = new THREE.DRACOLoader();
        dracoLoaderRef.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
        loader.setDRACOLoader(dracoLoaderRef);
      }catch(e){ console.warn('DRACOLoader init falló:', e); dracoLoaderRef = null; }
    }

    // Ocultar elemento fallback estático para que el canvas 3D sea visible
    var fallback = document.getElementById('geo3dFallback');
    if(fallback) fallback.style.display = 'none';
    canvas.style.display = 'block';

    // Intentar varias rutas comunes para mateo.glb (raíz, www, relativo)
    var candidatePaths = ['mateo.glb', 'www/mateo.glb', './mateo.glb', '/mateo.glb'];
    var tried = [];

    function tryLoadPath(idx){
      if(idx >= candidatePaths.length){
        // Todas las rutas fallaron
        var err = new Error('No se encontró mateo.glb en rutas: ' + tried.join(', '));
        console.warn(err);
        if(hint) hint.hidden = false;
        if(hint) {
          var span = hint.querySelector('span'); if(span) span.textContent = 'Error cargando Mateo 3D. Pulsa para reintentar.';
          hint.style.cursor = 'pointer'; hint.onclick = function(){ window.location.reload(); };
        }
        return;
      }
      var path = candidatePaths[idx];
      tried.push(path);
      loader.load(path,
        function(gltf){
          // Éxito: manejar igual que antes
          var model = gltf.scene;
        
        // Configurar materiales PBR, texturas y sombras
        model.traverse(function(child){
          if(child.isMesh){
            child.castShadow = true;
            child.receiveShadow = true;
            if(child.material){
              // Forzar valores defensivos
              child.material.roughness = Math.min(child.material.roughness || 0.6, 0.85);
              child.material.metalness = Math.min(child.material.metalness || 0.05, 0.2);
              if(child.material.map) child.material.map.encoding = THREE.sRGBEncoding;
              if(child.material.emissiveMap) child.material.emissiveMap.encoding = THREE.sRGBEncoding;
              child.material.envMapIntensity = child.material.envMapIntensity || 0.9;
              child.material.needsUpdate = true;
            }
            // Mejor rendimiento: activar frustum culling
            child.frustumCulled = true;
          }
        });

        // Auto-centrar y escalar al tamaño óptimo del pedestal
        var box = new THREE.Box3().setFromObject(model);
        var size = box.getSize(new THREE.Vector3());
        var center = box.getCenter(new THREE.Vector3());

        var maxDim = Math.max(size.x, size.y, size.z);
        var scale = 1.95 / (maxDim || 1);
        model.scale.setScalar(scale);

        model.position.x = -center.x * scale;
        model.position.y = -center.y * scale - 0.18;
        model.position.z = -center.z * scale;

        mateo3d.baseY = model.position.y;
        mateo3d.model = model;
        mateo3d.scene.add(model);
        mateo3d.loaded = true;

        // Asegurar que las mallas usen shading PBR y responder a la iluminación
        model.traverse(function(child){
          if(child.isMesh && child.material){
            // Ajustes defensivos para materiales del glTF
            if(child.material.roughness === undefined) child.material.roughness = 0.6;
            if(child.material.metalness === undefined) child.material.metalness = 0.05;
            if(child.material.envMapIntensity === undefined) child.material.envMapIntensity = 0.9;
            child.material.needsUpdate = true;
          }
        });

        // Activar sombras para las mallas
        model.traverse(function(child){ if(child.isMesh){ child.castShadow = true; child.receiveShadow = true; } });

        // Ocultar hint de carga, mostrar canvas 3D
        if(hint) hint.hidden = true;
        canvas.style.display = 'block';

        if(gltf.animations && gltf.animations.length > 0){
          mateo3d.mixer = new THREE.AnimationMixer(model);
          var action = mateo3d.mixer.clipAction(gltf.animations[0]);
          action.play();
        }

        // Liberar draco decoder si fue usado para ahorrar memoria
        try{ if(dracoLoaderRef && typeof dracoLoaderRef.dispose === 'function'){ dracoLoaderRef.dispose(); loader.setDRACOLoader(null); } }catch(e){}

        console.log('🎉 ¡Modelo 3D GLB de Mateo cargado exitosamente en Three.js!');
        },
        function(xhr){
          if(xhr.lengthComputable && hint){
            var pct = Math.round((xhr.loaded / xhr.total) * 100);
            var span = hint.querySelector('span');
            if(span) span.textContent = 'Cargando Mateo 3D (' + pct + '%)...';
          }
        },
        function(err){
          console.warn('Error cargando ruta', path, err);
          // intentar siguiente ruta
          tryLoadPath(idx + 1);
        }
      );
    }

    tryLoadPath(0);
  }

  // Ajustes de luces para sombras y realce PBR
  dirLight.castShadow = true;
  // Ajustar shadow map según memoria del dispositivo
  var shadowSize = 1024;
  try{ if(navigator.deviceMemory && navigator.deviceMemory < 4) shadowSize = 512; }catch(e){}
  dirLight.shadow.mapSize.width = shadowSize;
  dirLight.shadow.mapSize.height = shadowSize;
  dirLight.shadow.camera.left = -2;
  dirLight.shadow.camera.right = 2;
  dirLight.shadow.camera.top = 2;
  dirLight.shadow.camera.bottom = -2;

  // Resize responsivo: actualizar cámara y renderer al cambiar tamaño del contenedor
  function onMateoResize(){
    if(!mateo3d.camera || !mateo3d.renderer || !stage) return;
    var w = stage.clientWidth || 170;
    var h = stage.clientHeight || 260;
    if(h > 0){
      mateo3d.camera.aspect = w / h;
      mateo3d.camera.updateProjectionMatrix();
      mateo3d.renderer.setSize(w, h);
      mateo3d.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    }
  }
  window.addEventListener('resize', onMateoResize);

  // Desbloqueo universal de AudioContext en primer toque para iOS/Android
  var _unlockedAudio = false;
  function unlockAudioContext(){
    if(_unlockedAudio) return;
    try {
      ensureAudio();
      if(AC && AC.state === 'suspended') AC.resume();
      _unlockedAudio = true;
    } catch(e){}
  }
  window.addEventListener('touchstart', unlockAudioContext, { passive: true, once: true });
  window.addEventListener('pointerdown', unlockAudioContext, { passive: true, once: true });

  // Interacción Drag / Touch para rotar a Mateo en 3D
  stage.addEventListener('mousedown', function(e){
    mateo3d.isDragging = true;
    mateo3d.prevMouseX = e.clientX;
  });
  window.addEventListener('mousemove', function(e){
    if(mateo3d.isDragging && mateo3d.model){
      var delta = e.clientX - mateo3d.prevMouseX;
      mateo3d.targetRotationY += delta * 0.015;
      mateo3d.prevMouseX = e.clientX;
    }
  });
  window.addEventListener('mouseup', function(){
    mateo3d.isDragging = false;
  });

  stage.addEventListener('touchstart', function(e){
    if(e.touches.length === 1){
      mateo3d.isDragging = true;
      mateo3d.prevMouseX = e.touches[0].clientX;
    }
  }, { passive: true });
  window.addEventListener('touchmove', function(e){
    if(mateo3d.isDragging && mateo3d.model && e.touches.length === 1){
      var delta = e.touches[0].clientX - mateo3d.prevMouseX;
      mateo3d.targetRotationY += delta * 0.015;
      mateo3d.prevMouseX = e.touches[0].clientX;
    }
  }, { passive: true });
  window.addEventListener('touchend', function(){
    mateo3d.isDragging = false;
  });

  // Añadir OrbitControls (mejor experiencia táctil y con inercia)
  try{
    if(typeof THREE.OrbitControls !== 'undefined'){
      mateo3d.controls = new THREE.OrbitControls(mateo3d.camera, mateo3d.renderer.domElement);
      mateo3d.controls.enablePan = false;
      mateo3d.controls.enableDamping = true;
      mateo3d.controls.dampingFactor = 0.08;
      mateo3d.controls.minDistance = 1.4;
      mateo3d.controls.maxDistance = 6;
      // Disable zoom to keep widget size stable on scroll/pinch
      mateo3d.controls.enableZoom = false;
      mateo3d.controls.maxPolarAngle = Math.PI * 0.6;
    }
  }catch(e){ console.warn('OrbitControls no disponibles:', e); }
  // Prevent wheel from zooming/scrolling the widget area
  try{ stage.addEventListener('wheel', function(ev){ ev.preventDefault(); }, { passive: false }); }catch(e){}

  // Loop de Render y Animación 3D
  function animate(){
    requestAnimationFrame(animate);
    var delta = mateo3d.clock.getDelta();
    var time = mateo3d.clock.getElapsedTime();

    if(mateo3d.mixer) mateo3d.mixer.update(delta);

    if(mateo3d.controls) mateo3d.controls.update();

    if(mateo3d.model){
      // Levitación suave continua estilo GeoGuessr
      var floatOffset = Math.sin(time * 2.2) * 0.04;
      mateo3d.model.position.y = mateo3d.baseY + floatOffset + mateo3d.jumpOffset;

      // Rotación suave hacia el target o auto-idle
      if(!mateo3d.isDragging){
        if(mateo3d.state === 'fire'){
          mateo3d.targetRotationY += delta * 2.6;
        } else if(mateo3d.state === 'victory'){
          mateo3d.targetRotationY += delta * 3.6;
        } else {
          // Oscilación sutil natural
          mateo3d.targetRotationY = Math.sin(time * 0.8) * 0.25;
        }
      }
      mateo3d.model.rotation.y += (mateo3d.targetRotationY - mateo3d.model.rotation.y) * 0.1;

      // Decaimiento del salto
      if(mateo3d.jumpOffset > 0){
        mateo3d.jumpOffset = Math.max(0, mateo3d.jumpOffset - delta * 1.5);
      }
    }

    mateo3d.renderer.render(mateo3d.scene, mateo3d.camera);
  }
  animate();
}

function updateMateo3DState(state){
  mateo3d.state = state;
  if(!mateo3d.model) return;

  if(state === 'happy'){
    mateo3d.jumpOffset = 0.25;
  } else if(state === 'victory'){
    mateo3d.jumpOffset = 0.45;
  } else if(state === 'oops'){
    mateo3d.model.rotation.z = 0.15;
    setTimeout(function(){ if(mateo3d.model) mateo3d.model.rotation.z = 0; }, 400);
  }
}

// Inicializar motor 3D de Mateo
try { initMateo3D(); } catch(e){ console.warn('ThreeJS 3D init:', e); }

// ONBOARDING / FIRST RUN
function showOnboarding(){
  var m = document.getElementById('onboardingModal');
  if(!m) return; m.hidden = false;
}
function hideOnboarding(){
  var m = document.getElementById('onboardingModal'); if(!m) return; m.hidden = true;
  storeSet('pf_onboarded', '1');
}

// Hook up onboarding buttons
try{
  var onboardSkip = document.getElementById('onboardSkip');
  var onboardNext = document.getElementById('onboardNext');
  var onboardStartCal = document.getElementById('onboardStartCal');
  var onboardStopCal = document.getElementById('onboardStopCal');
  var onboardCalArea = document.getElementById('onboardCalArea');
  var onboardMeter = document.getElementById('onboardMeter');
  if(onboardSkip) onboardSkip.addEventListener('click', function(){ hideOnboarding(); });
  if(onboardNext) onboardNext.addEventListener('click', function(){ hideOnboarding(); });
  if(onboardStartCal) onboardStartCal.addEventListener('click', function(){
    if(onboardCalArea) onboardCalArea.style.display = 'block';
    if(onboardStartCal) onboardStartCal.style.display = 'none';
    if(onboardStopCal) onboardStopCal.style.display = 'inline-block';
    // start microphone and update meter
    startMic();
    // prepare samples buffer
    window._onboardSamples = [];
    window._onboardCalInterval = setInterval(function(){
      if(onboardMeter && micBuf){
        var s = 0; for(var i=0;i<micBuf.length;i++) s += micBuf[i]*micBuf[i];
        var rms = Math.sqrt(s / micBuf.length);
        window._onboardSamples.push(rms);
        var disp = Math.min(100, Math.round(rms * 1000));
        onboardMeter.style.width = disp + '%';
      }
    }, 120);
  });
  if(onboardStopCal) onboardStopCal.addEventListener('click', function(){
    // compute mean RMS from samples and derive gain
    try{
      if(window._onboardCalInterval) clearInterval(window._onboardCalInterval);
      var samples = window._onboardSamples || [];
      if(samples.length){
        var sum = 0; for(var j=0;j<samples.length;j++) sum += samples[j];
        var mean = sum / samples.length;
        var target = 0.12; // desired RMS level for calibration
        var gain = 1.0;
        if(mean > 0) gain = Math.min(8, target / mean);
        micGain = gain; storeSet('pf_mic_gain', String(gain));
        toast('🔊 Calibración guardada (ganancia x' + (gain.toFixed(2)) + ')');
      } else {
        toast('⚠ No se detectó señal. Intenta nuevamente.');
      }
    }catch(e){ console.warn('Calib error', e); }
    // stop mic and cleanup
    stopMic();
    if(onboardStopCal) onboardStopCal.style.display = 'none';
    if(onboardStartCal) onboardStartCal.style.display = 'inline-block';
    window._onboardSamples = [];
  });
}catch(e){ console.warn('Onboarding init error', e); }

// Show onboarding on first run
try{
  var seen = storeGet('pf_onboarded');
  if(!seen){ setTimeout(showOnboarding, 600); }
}catch(e){}

/* ============ PANTALLA DE CARGA (LOADER) ============ */
(function(){
  var pct = 0;
  var fill = document.getElementById('loadFill');
  var txt = document.getElementById('loadPct');
  var iv = setInterval(function(){
    pct = Math.min(100, pct + 2);
    if(fill) fill.style.width = pct + '%';
    if(txt) txt.textContent = pct + '%';
    if(pct >= 100){
      clearInterval(iv);
      var l = document.getElementById('loader');
      if(l){
        l.classList.add('gone');
        setTimeout(function(){ if(l.parentNode) l.parentNode.removeChild(l); }, 700);
      }
    }
  }, 25);
})();
