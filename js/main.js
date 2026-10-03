/* ==========================================================================
   PIANOFÁCIL PRO · MÓDULO 8: ORQUESTADOR PRINCIPAL, UI & CICLO DE VIDA PWA
   PianoFácil PRO · js/main.js
   ========================================================================== */

/* ============ PESTAÑAS Y NAVEGACIÓN ============ */
function setMode(mode){
  var tabL = $('#tabLearn'); if(tabL) tabL.classList.toggle('active', mode === 'learn');
  var tabF = $('#tabFree'); if(tabF) tabF.classList.toggle('active', mode === 'free');
  var navH = $('#tabNavHome'); if(navH) navH.classList.toggle('active', mode === 'learn');
  var navS = $('#tabNavSettings'); if(navS) navS.classList.toggle('active', mode === 'free');
  var lp = $('#learnPanel'); if(lp) lp.hidden = (mode !== 'learn');
  var fp = $('#freePanel'); if(fp) fp.hidden = (mode !== 'free');
  if(mode === 'free' && typeof exitPractice === 'function') exitPractice();
}

if($('#tabLearn')) $('#tabLearn').addEventListener('click', function(){
  if(typeof playUiSound === 'function') playUiSound('click');
  if(typeof practice !== 'undefined' && practice.active && typeof exitPractice === 'function') exitPractice();
  setMode('learn');
});
if($('#tabFree')) $('#tabFree').addEventListener('click', function(){
  if(typeof playUiSound === 'function') playUiSound('click');
  setMode('free');
});

// Píldoras de Navegación Superior Fieles al Mockup
if($('#tabNavHome')) $('#tabNavHome').addEventListener('click', function(){
  if(typeof playUiSound === 'function') playUiSound('click');
  if(typeof practice !== 'undefined' && practice.active && typeof exitPractice === 'function') exitPractice();
  setMode('learn');
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
if($('#tabNavLearn')) $('#tabNavLearn').addEventListener('click', function(){
  if(typeof playUiSound === 'function') playUiSound('click');
  setMode('learn');
  var el = document.getElementById('adventureWorldsBarCard') || document.getElementById('pathBox');
  if(el) el.scrollIntoView({ behavior: 'smooth' });
});
if($('#tabNavBadges')) $('#tabNavBadges').addEventListener('click', function(){
  if(typeof playUiSound === 'function') playUiSound('click');
  var b = document.getElementById('badgesBar');
  if(b) b.scrollIntoView({ behavior: 'smooth' });
});
if($('#tabNavSettings')) $('#tabNavSettings').addEventListener('click', function(){
  if(typeof playUiSound === 'function') playUiSound('click');
  setMode('free');
});

// Chip de Usuario
if($('#headerUserChip')) $('#headerUserChip').addEventListener('click', function(){
  if(typeof playUiSound === 'function') playUiSound('click');
  var sb = document.getElementById('statsBtn');
  if(sb) sb.click();
});

// Dock / Menú Lateral de la Consola
if($('#sbmRhythms')) $('#sbmRhythms').addEventListener('click', function(){
  if(typeof playUiSound === 'function') playUiSound('click');
  document.querySelectorAll('.dockBtn').forEach(function(b){ b.classList.remove('active'); });
  this.classList.add('active');
  if(typeof selectedLobbyStageFilter !== 'undefined'){
    selectedLobbyStageFilter = 1;
    if(typeof renderPath === 'function') renderPath();
  }
});
if($('#sbmFavorites')) $('#sbmFavorites').addEventListener('click', function(){
  if(typeof playUiSound === 'function') playUiSound('click');
  document.querySelectorAll('.dockBtn').forEach(function(b){ b.classList.remove('active'); });
  this.classList.add('active');
  if(typeof toast === 'function') toast('⭐ Mostrando canciones y melodías favoritas');
  var songNodes = document.querySelectorAll('.nodeItem.is-song');
  if(songNodes && songNodes.length && songNodes[0]){
    songNodes[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
});
if($('#sbmAchievements')) $('#sbmAchievements').addEventListener('click', function(){
  if(typeof playUiSound === 'function') playUiSound('click');
  document.querySelectorAll('.dockBtn').forEach(function(b){ b.classList.remove('active'); });
  this.classList.add('active');
  var b = document.getElementById('badgesBar');
  if(b) b.scrollIntoView({ behavior: 'smooth' });
});
if($('#sbmMiniGames')) $('#sbmMiniGames').addEventListener('click', function(){
  if(typeof playUiSound === 'function') playUiSound('click');
  document.querySelectorAll('.dockBtn').forEach(function(b){ b.classList.remove('active'); });
  this.classList.add('active');
  var d = document.getElementById('duelBtn');
  if(d) d.click();
});

/* ============ TECLADO FÍSICO PC ============ */
window.addEventListener('keydown', function(e){
  if(e.repeat) return;
  if(e.key === 'Escape'){
    if($('#modal') && !$('#modal').hidden){ if(typeof closeToPath === 'function') closeToPath(); }
    else if(typeof practice !== 'undefined' && practice.active && typeof exitPractice === 'function'){ exitPractice(); }
    return;
  }
  var k = e.key.toLowerCase();
  if(typeof KEYMAP !== 'undefined' && (k in KEYMAP)){
    if(typeof triggerNote === 'function') triggerNote(KEYMAP[k], false);
  }
});

window.addEventListener('blur', function(){
  if(typeof keyEls !== 'undefined'){
    for(var k in keyEls) keyEls[k].classList.remove('down');
  }
});

/* ============ GRABADOR DE PISTAS ============ */
var rec = { state: 'idle', events: [], t0: 0, timer: null, playing: false, timeouts: [] };
function fmt(ms){ var s = Math.floor(ms / 1000); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }
function recordEvent(m){ if(rec.state === 'rec') rec.events.push({ m: m, t: performance.now() - rec.t0 }); }

if($('#recBtn')) $('#recBtn').addEventListener('click', function(){
  if(typeof playUiSound === 'function') playUiSound('click');
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
  rec.playing = false;
  var rb = $('#recBtn'); if(rb) rb.disabled = false;
  var pb = $('#playRecBtn'); if(pb) pb.textContent = '▶ Reproducir';
}

if($('#playRecBtn')) $('#playRecBtn').addEventListener('click', function(){
  if(typeof playUiSound === 'function') playUiSound('click');
  if(rec.playing){ stopRecorderPlayback(); return; }
  if(!rec.events.length) return;
  rec.playing = true; rec.timeouts = [];
  this.textContent = '⏹ Detener';
  var rb = $('#recBtn'); if(rb) rb.disabled = true;
  rec.events.forEach(function(e){
    rec.timeouts.push(setTimeout(function(){
      if(typeof triggerNote === 'function') triggerNote(e.m, false, true);
    }, e.t));
  });
  var end = rec.events[rec.events.length - 1].t + 800;
  rec.timeouts.push(setTimeout(function(){
    rec.playing = false;
    var rb2 = $('#recBtn'); if(rb2) rb2.disabled = false;
    var pb2 = $('#playRecBtn'); if(pb2) pb2.textContent = '▶ Reproducir';
  }, end));
});

if($('#clearRecBtn')) $('#clearRecBtn').addEventListener('click', function(){
  if(typeof playUiSound === 'function') playUiSound('click');
  rec.events = [];
  var pb = $('#playRecBtn'); if(pb) pb.disabled = true;
  var cb = $('#clearRecBtn'); if(cb) cb.disabled = true;
  var rs = $('#recStatus'); if(rs) rs.textContent = 'Listo para grabar';
});

/* ============ CONTROLES DE ENTRADA EN ESTUDIO LIBRE ============ */
if($('#micBtn')) $('#micBtn').addEventListener('click', function(){
  if(typeof playUiSound === 'function') playUiSound('click');
  micActive ? stopMic() : startMic();
});
if($('#srcMic')) $('#srcMic').addEventListener('click', function(){
  if(typeof playUiSound === 'function') playUiSound('click');
  setInputMode('mic', true);
});
if($('#srcPiano')) $('#srcPiano').addEventListener('click', function(){
  if(typeof playUiSound === 'function') playUiSound('click');
  setInputMode('virtual', true);
});
if($('#srcMidi')) $('#srcMidi').addEventListener('click', function(){
  if(typeof playUiSound === 'function') playUiSound('click');
  setInputMode('midi', true);
});
if($('#tglMidiSynth')){
  $('#tglMidiSynth').addEventListener('change', function(){
    if(typeof MIDI !== 'undefined') MIDI.setSynthSound(this.checked);
  });
}

/* ============ SELECTOR TRIPLE DE MODO DE ENTRADA (EN PANTALLA / MICRÓFONO / MIDI) ============ */
function setInputMode(mode, showToastMsg){
  storeSet('pf_input_mode', mode);
  document.body.classList.toggle('mic-ready', mode === 'mic');
  document.body.classList.toggle('midi-ready', mode === 'midi');
  var btnVirt = document.getElementById('inputModeVirtual');
  var btnMic = document.getElementById('inputModeMic');
  var btnMidi = document.getElementById('inputModeMidi');
  var srcPiano = document.getElementById('srcPiano');
  var srcMic = document.getElementById('srcMic');
  var srcMidi = document.getElementById('srcMidi');
  var micDot = document.getElementById('isbMicIndicator');
  var micPanel = document.getElementById('micPanel');
  var midiPanel = document.getElementById('midiPanel');
  var kidMicBtn = document.getElementById('kidMicBtn');

  // Sincronizar botones de Estudio Libre
  if(srcPiano) srcPiano.classList.toggle('active', mode === 'virtual');
  if(srcMic) srcMic.classList.toggle('active', mode === 'mic');
  if(srcMidi) srcMidi.classList.toggle('active', mode === 'midi');

  if(mode === 'mic'){
    if(btnMic) btnMic.classList.add('active');
    if(btnVirt) btnVirt.classList.remove('active');
    if(btnMidi) btnMidi.classList.remove('active');
    if(micDot) micDot.hidden = false;
    if(micPanel) micPanel.hidden = false;
    if(midiPanel) midiPanel.hidden = true;
    if(kidMicBtn) kidMicBtn.textContent = '🎤 Mic On';
    if(typeof startMic === 'function') startMic();
    if(showToastMsg) toast('🎤 Modo Piano Acústico activado: ¡Toca tu piano real!');
  } else if(mode === 'midi'){
    if(btnMidi) btnMidi.classList.add('active');
    if(btnVirt) btnVirt.classList.remove('active');
    if(btnMic) btnMic.classList.remove('active');
    if(micDot) micDot.hidden = true;
    if(micPanel) micPanel.hidden = true;
    if(midiPanel) midiPanel.hidden = false;
    if(kidMicBtn) kidMicBtn.textContent = '🔌 MIDI';
    if(typeof stopMic === 'function') stopMic();
    if(typeof ensureAudio === 'function') ensureAudio();
    if(typeof MIDI !== 'undefined' && MIDI.isConnected()){
      if(showToastMsg) toast('🔌 Modo Teclado Digital activo: ¡Toca en tu piano conectado!');
    } else {
      if(showToastMsg) toast('🔌 Modo Teclado Digital: Conecta tu piano por USB o Bluetooth');
    }
  } else {
    if(btnVirt) btnVirt.classList.add('active');
    if(btnMic) btnMic.classList.remove('active');
    if(btnMidi) btnMidi.classList.remove('active');
    if(micDot) micDot.hidden = true;
    if(micPanel) micPanel.hidden = true;
    if(midiPanel) midiPanel.hidden = true;
    if(kidMicBtn) kidMicBtn.textContent = '🎹 Teclado';
    if(typeof stopMic === 'function') stopMic();
    if(typeof ensureAudio === 'function') ensureAudio();
    if(showToastMsg) toast('🎹 Modo En Pantalla: ¡Toca las teclas con tus dedos!');
  }
}

function initInputModeSwitcher(){
  var btnVirt = document.getElementById('inputModeVirtual');
  var btnMic = document.getElementById('inputModeMic');
  var btnMidi = document.getElementById('inputModeMidi');
  if(btnVirt){
    btnVirt.addEventListener('click', function(){
      if(typeof playUiSound === 'function') playUiSound('click');
      setInputMode('virtual', true);
    });
  }
  if(btnMic){
    btnMic.addEventListener('click', function(){
      if(typeof playUiSound === 'function') playUiSound('click');
      setInputMode('mic', true);
    });
  }
  if(btnMidi){
    btnMidi.addEventListener('click', function(){
      if(typeof playUiSound === 'function') playUiSound('click');
      setInputMode('midi', true);
    });
  }

  var saved = storeGet('pf_input_mode');
  if(saved === 'mic'){
    setInputMode('mic', false);
  } else if(saved === 'midi'){
    setInputMode('midi', false);
  } else {
    setInputMode('virtual', false);
  }
}

/* ============ BOTÓN DE MICRÓFONO PARA MODO NIÑO ============ */
function ensureKidMicButton(enabled){
  try{
    var header = document.querySelector('header .headerActions'); if(!header) return;
    var existing = document.getElementById('kidMicBtn');
    if(enabled){
      if(existing) return;
      var b = document.createElement('button'); b.id = 'kidMicBtn'; b.type = 'button'; b.className = 'btn small ghost';
      var curMode = storeGet('pf_input_mode') || 'virtual';
      b.textContent = curMode === 'mic' ? '🎤 Mic On' : (curMode === 'midi' ? '🔌 MIDI' : '🎹 Teclado');
      b.addEventListener('click', function(){
        if(typeof playUiSound === 'function') playUiSound('click');
        var m = storeGet('pf_input_mode') || 'virtual';
        if(m === 'virtual'){
          setInputMode('mic', true);
        } else if(m === 'mic'){
          setInputMode('midi', true);
        } else {
          setInputMode('virtual', true);
        }
      });
      header.appendChild(b);
    }else{
      if(existing) existing.remove();
    }
  }catch(e){ console.warn('ensureKidMicButton error', e); }
}

/* ============ MODAL DE ESTADÍSTICAS SEMANALES ============ */
if($('#statsBtn')) $('#statsBtn').addEventListener('click', function(){
  if(typeof playUiSound === 'function') playUiSound('click');
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
if($('#closeStatsBtn')) $('#closeStatsBtn').addEventListener('click', function(){
  if(typeof playUiSound === 'function') playUiSound('click');
  if($('#statsModal')) $('#statsModal').hidden = true;
});

/* ============ MISIONES DIARIAS ============ */
if($('#missionsBtn')) $('#missionsBtn').addEventListener('click', function(){
  if(typeof playUiSound === 'function') playUiSound('click');
  if(typeof renderMissionsModal === 'function') renderMissionsModal();
  if($('#missionsModal')) $('#missionsModal').hidden = false;
});
if($('#closeMissionsBtn')) $('#closeMissionsBtn').addEventListener('click', function(){
  if(typeof playUiSound === 'function') playUiSound('click');
  if($('#missionsModal')) $('#missionsModal').hidden = true;
});
if($('#claimMissionsBtn')) $('#claimMissionsBtn').addEventListener('click', function(){
  if(typeof claimMissionsReward === 'function') claimMissionsReward();
});

/* ============ GRABADORA Y REPRODUCTOR FAMILIAR ============ */
if($('#familyRecBtn')) $('#familyRecBtn').addEventListener('click', function(){
  if(typeof toggleFamilyRecording === 'function') toggleFamilyRecording();
});
if($('#closePlaybackBtn')) $('#closePlaybackBtn').addEventListener('click', function(){
  if(typeof playUiSound === 'function') playUiSound('click');
  var aud = document.getElementById('familyPlaybackAudio');
  if(aud){ aud.pause(); aud.currentTime = 0; }
  if($('#playbackModal')) $('#playbackModal').hidden = true;
});

/* ============ PAUSA DE ESTIRAMIENTO ============ */
if($('#closePauseBtn')) $('#closePauseBtn').addEventListener('click', function(){
  if(typeof playUiSound === 'function') playUiSound('click');
  if($('#stretchPauseModal')) $('#stretchPauseModal').hidden = true;
  if(typeof sessionContinuousSec !== 'undefined') sessionContinuousSec = 0;
});

/* ============ ZONA DE PADRES / GATE PARENTAL ============ */
function getParentPin(){
  return storeGet('pf_parent_pin') || '2026';
}

function openParentGate(){
  var q = document.getElementById('pinQuestion');
  var inp = document.getElementById('pinAnswer');
  if(q) q.textContent = '🔒 PIN de Padres (4 dígitos):';
  if(inp){
    inp.value = '';
    inp.type = 'password';
    inp.maxLength = 4;
    inp.placeholder = '••••';
  }
  if($('#parentPinModal')) $('#parentPinModal').hidden = false;
  if(inp) inp.focus();
}

function verifyParentPin(){
  var inp = document.getElementById('pinAnswer');
  if(!inp) return;
  var val = inp.value.trim();
  if(val === getParentPin()){
    if($('#parentPinModal')) $('#parentPinModal').hidden = true;
    openParentsPanel();
  } else {
    toast('❌ PIN incorrecto. (PIN por defecto: 2026)');
    if(inp){ inp.value = ''; inp.focus(); }
  }
}

function openParentsPanel(){
  var d = getDailyStats();
  var prog = getPath();
  var totalStars = 0, completedCount = 0;
  for(var k in prog){
    if(prog[k] > 0){
      totalStars += prog[k];
      completedCount++;
    }
  }
  
  if($('#pTotalTime')) $('#pTotalTime').textContent = fmtTotal(totalSec);
  if($('#pStreak')) $('#pStreak').textContent = d.streak + (d.streak === 1 ? ' Día' : ' Días');
  if($('#pStars')) $('#pStars').textContent = totalStars + ' ⭐';
  if($('#pLevels')) $('#pLevels').textContent = completedCount + ' / ' + (typeof LEVELS !== 'undefined' ? LEVELS.length : 44);
  
  var slider = document.getElementById('micGainSlider');
  var valTxt = document.getElementById('micGainVal');
  if(slider){
    slider.value = micGain || 1.0;
    if(valTxt) valTxt.textContent = 'x' + parseFloat(slider.value).toFixed(1);
  }
  
  if($('#parentsModal')) $('#parentsModal').hidden = false;
}

if($('#parentsBtn')) $('#parentsBtn').addEventListener('click', function(){
  if(typeof playUiSound === 'function') playUiSound('click');
  openParentGate();
});
if($('#submitPinBtn')) $('#submitPinBtn').addEventListener('click', verifyParentPin);
if($('#cancelPinBtn')) $('#cancelPinBtn').addEventListener('click', function(){
  if($('#parentPinModal')) $('#parentPinModal').hidden = true;
});
if($('#micGainSlider')) $('#micGainSlider').addEventListener('input', function(){
  micGain = parseFloat(this.value);
  storeSet('pf_mic_gain', String(micGain));
  var valTxt = document.getElementById('micGainVal');
  if(valTxt) valTxt.textContent = 'x' + micGain.toFixed(1);
});
if($('#closeParentsBtn')) $('#closeParentsBtn').addEventListener('click', function(){
  if(typeof playUiSound === 'function') playUiSound('click');
  if($('#parentsModal')) $('#parentsModal').hidden = true;
  toast('✅ Ajustes guardados correctamente.');
});

/* ============ DUELO MUSICAL ============ */
var _duelState = {
  active: false,
  turn: 1,
  seq: [60, 62, 64, 65, 67, 72],
  idx: 0,
  score1: 0,
  score2: 0,
  startT: 0
};

function openDuelModal(){
  _duelState.active = false;
  _duelState.turn = 1;
  _duelState.score1 = 0;
  _duelState.score2 = 0;
  _duelState.idx = 0;
  updateDuelUI();
  if($('#duelModal')) $('#duelModal').hidden = false;
}

function updateDuelUI(){
  var p1 = document.getElementById('duelP1');
  var p2 = document.getElementById('duelP2');
  var s1 = document.getElementById('duelScore1');
  var s2 = document.getElementById('duelScore2');
  var tt = document.getElementById('duelTurnTxt');
  var btn = document.getElementById('startDuelTurnBtn');
  
  if(s1) s1.textContent = _duelState.score1 + ' pts';
  if(s2) s2.textContent = _duelState.score2 + ' pts';
  
  if(_duelState.turn === 1){
    if(p1) p1.classList.add('active');
    if(p2) p2.classList.remove('active');
    if(tt) tt.innerHTML = 'Turno 1: <b>Jugador 1 🎹</b>';
    if(btn) btn.textContent = '▶ Iniciar Turno 1';
  } else if(_duelState.turn === 2){
    if(p1) p1.classList.remove('active');
    if(p2) p2.classList.add('active');
    if(tt) tt.innerHTML = 'Turno 2: <b>Jugador 2 / Familia 🌟</b>';
    if(btn) btn.textContent = '▶ Iniciar Turno de Jugador 2';
  } else {
    if(p1) p1.classList.remove('active');
    if(p2) p2.classList.remove('active');
    var winTxt = '';
    if(_duelState.score1 > _duelState.score2) winTxt = '🏆 ¡Jugador 1 es el Campeón del Duelo! 🎉';
    else if(_duelState.score2 > _duelState.score1) winTxt = '🏆 ¡Jugador 2 gana el Duelo! 🎉';
    else winTxt = '🤝 ¡Empate de Maestros de Piano! ✨';
    if(tt) tt.innerHTML = '<b>' + winTxt + '</b>';
    if(btn) btn.textContent = '🔄 Revancha (Jugar otra vez)';
  }
}

function startDuelTurn(){
  if(_duelState.turn > 2){
    openDuelModal();
    return;
  }
  _duelState.active = true;
  _duelState.idx = 0;
  _duelState.startT = performance.now();
  if($('#duelModal')) $('#duelModal').hidden = true;
  toast('🎹 ¡Toca la secuencia del duelo en el piano!');
  var duelLvl = {
    id: 9999,
    name: '⚔️ Duelo Musical: Ronda ' + _duelState.turn,
    stage: 1,
    bpm: 90,
    notes: _duelState.seq.map(function(m){ return { midi: m, dur: 1 }; }),
    ui: { hand: true, score: true }
  };
  startPractice(duelLvl);
}

if($('#duelBtn')) $('#duelBtn').addEventListener('click', function(){
  if(typeof playUiSound === 'function') playUiSound('click');
  openDuelModal();
});
if($('#closeDuelBtn')) $('#closeDuelBtn').addEventListener('click', function(){
  if(typeof playUiSound === 'function') playUiSound('click');
  if($('#duelModal')) $('#duelModal').hidden = true;
});
if($('#startDuelTurnBtn')) $('#startDuelTurnBtn').addEventListener('click', function(){
  if(typeof playUiSound === 'function') playUiSound('click');
  startDuelTurn();
});

/* ============ CONTROLES DE AJUSTES ============ */
if($('#vol')) $('#vol').addEventListener('input', function(){
  settings.vol = this.value / 100;
  if(master) master.gain.value = settings.vol;
  saveSettings();
});
if($('#sysSel')) $('#sysSel').addEventListener('change', function(){
  settings.sys = this.value;
  if(typeof refreshLabels === 'function') refreshLabels();
  saveSettings();
  if(typeof refreshTeach === 'function') refreshTeach();
});
if($('#tglNames')) $('#tglNames').addEventListener('change', function(){
  settings.names = this.checked;
  if(typeof refreshLabels === 'function') refreshLabels();
  saveSettings();
});
if($('#tglHints')) $('#tglHints').addEventListener('change', function(){
  settings.hints = this.checked;
  saveSettings();
});
if($('#tglStaffNames')) $('#tglStaffNames').addEventListener('change', function(){
  settings.staffNames = this.checked;
  saveSettings();
  if(typeof refreshTeach === 'function') refreshTeach();
});
if($('#tglWaitMode')) $('#tglWaitMode').addEventListener('change', function(){
  settings.waitMode = this.checked;
  saveSettings();
});
if($('#tglSynthesia')) $('#tglSynthesia').addEventListener('change', function(){
  settings.synthesia = this.checked;
  saveSettings();
  if($('#fallingCanvas')) $('#fallingCanvas').hidden = !settings.synthesia;
  if(settings.synthesia && typeof drawSynthesia === 'function') requestAnimationFrame(drawSynthesia);
});

/* ============ ONBOARDING / PRIMERA MISIÓN ============ */
function showOnboarding(){
  var m = document.getElementById('onboardingModal');
  if(!m) return; m.hidden = false;
}
function hideOnboarding(){
  var m = document.getElementById('onboardingModal'); if(!m) return; m.hidden = true;
  storeSet('pf_onboarded', '1');
}

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
    startMic();
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
    try{
      if(window._onboardCalInterval) clearInterval(window._onboardCalInterval);
      var samples = window._onboardSamples || [];
      if(samples.length){
        var sum = 0; for(var j=0;j<samples.length;j++) sum += samples[j];
        var mean = sum / samples.length;
        var target = 0.12;
        var gain = 1.0;
        if(mean > 0) gain = Math.min(8, target / mean);
        micGain = gain; storeSet('pf_mic_gain', String(gain));
        toast('🔊 Calibración guardada (ganancia x' + (gain.toFixed(2)) + ')');
      } else {
        toast('⚠ No se detectó señal. Intenta nuevamente.');
      }
    }catch(e){ console.warn('Calib error', e); }
    stopMic();
    if(onboardStopCal) onboardStopCal.style.display = 'none';
    if(onboardStartCal) onboardStartCal.style.display = 'inline-block';
    window._onboardSamples = [];
  });
}catch(e){ console.warn('Onboarding init error', e); }

try{
  var seen = storeGet('pf_onboarded');
  if(!seen){ setTimeout(showOnboarding, 600); }
}catch(e){}

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

/* ============ EVENTOS Y FRASES DE ÁNIMO ============ */
if($('#headerAvatarBtn')) $('#headerAvatarBtn').addEventListener('click', triggerAvatarGreeting);
if($('#companionBar')) $('#companionBar').addEventListener('click', triggerAvatarGreeting);

// 1. Botón circular de nube: abre o cierra la nube con los textos (sin cambiar el mensaje)
var avatarInteractBtn = document.getElementById('avatarInteractBtn');
if(avatarInteractBtn){
  avatarInteractBtn.addEventListener('click', function(e){
    e.stopPropagation();
    if(typeof playUiSound === 'function') playUiSound('click');
    if(typeof toggleFloatingSpeechBubble === 'function') toggleFloatingSpeechBubble();
  });
}

// 2. Cuadro de texto / nube: al pincharlo, cambia el mensaje
var floatingSpeechBubble = document.getElementById('floatingSpeechBubble');
if(floatingSpeechBubble){
  floatingSpeechBubble.addEventListener('click', function(e){
    e.stopPropagation();
    triggerAvatarGreeting();
  });
}

// 3. Personaje 3D / Widget del compañero: al pincharlo (sin arrastrar), cambia el mensaje
var avatar3dStage = document.getElementById('avatar3dStage');
if(avatar3dStage){
  avatar3dStage.addEventListener('click', function(e){
    if(e.target && (e.target.id === 'avatarInteractBtn' || e.target.closest('#avatarInteractBtn'))) return;
    if(typeof mateo3d !== 'undefined' && (mateo3d.isDragging || mateo3d.hasDragged)) return;
    triggerAvatarGreeting();
  });
}

var _autoAvatarEncouragementTimer = setInterval(function(){
  if(typeof practice === 'undefined' || !practice || !practice.active){
    var tip = AVATAR_TIPS[Math.floor(Math.random() * AVATAR_TIPS.length)];
    setAvatarState('happy', tip, 6000);
  }
}, 22000);

/* ============ INICIALIZACIÓN GLOBAL ============ */
function initApp(){
  try{ rebuildPiano(); }catch(e){}
  if($('#vol')) $('#vol').value = Math.round(settings.vol * 100);
  if($('#sysSel')) $('#sysSel').value = settings.sys;
  if($('#tglNames')) $('#tglNames').checked = settings.names;
  if($('#tglHints')) $('#tglHints').checked = settings.hints;
  if($('#tglStaffNames')) $('#tglStaffNames').checked = settings.staffNames;
  var twm = $('#tglWaitMode'); if(twm) twm.checked = settings.waitMode;
  var tsy = $('#tglSynthesia'); if(tsy) tsy.checked = settings.synthesia;
  if(settings.synthesia && $('#fallingCanvas')){
    $('#fallingCanvas').hidden = false;
    if(typeof drawSynthesia === 'function') requestAnimationFrame(drawSynthesia);
  }

  var kidBtn = document.getElementById('kidModeBtn');
  if(kidBtn){
    kidBtn.addEventListener('click', function(){
      setKidMode(!_kidMode, true);
    });
  }

  setKidMode(_kidMode, false);
  initInputModeSwitcher();
  refreshLabels();
  renderPath();
  paintTime();
  setMode('learn');
  setAvatarState('idle', '¡Hola! Elige una lección para comenzar 🌟', 0);
}

// Timer de práctica
setInterval(function(){
  if(typeof practice !== 'undefined' && practice.active){
    sessionPracticeSec++; totalSec++;
    if(totalSec % 10 === 0) storeSet('pf_time', String(totalSec));
    if(totalSec % 10 === 0) updateDailyTime(10);
    if(sessionPracticeSec >= 900 && !notified15){
      notified15 = true;
      showMsg('🌟 ¡Llevas 15 minutos practicando!<br>Sigues avanzando con maestría. ¡Qué orgullo!', 4200, null);
    }
  }
  paintTime();
}, 1000);

window.addEventListener('beforeunload', function(){
  storeSet('pf_time', String(totalSec));
  if(typeof practice !== 'undefined' && practice.level) storeSet('pf_last', String(practice.level.id));
  if(sessionPracticeSec % 10 !== 0) updateDailyTime(sessionPracticeSec % 10);
});

// Pantalla de carga (Loader)
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

/* ============ SCREEN WAKE LOCK (PANTALLA SIEMPRE ENCENDIDA) ============ */
var _wakeLock = null;

async function requestScreenWakeLock(){
  try {
    if('wakeLock' in navigator && !_wakeLock){
      _wakeLock = await navigator.wakeLock.request('screen');
      _wakeLock.addEventListener('release', function(){
        _wakeLock = null;
      });
    }
  } catch(e){}
}

function releaseScreenWakeLock(){
  if(_wakeLock){
    try { _wakeLock.release(); }catch(e){}
    _wakeLock = null;
  }
}

// Re-adquirir Wake Lock al volver de segundo plano
document.addEventListener('visibilitychange', function(){
  if(document.visibilityState === 'visible'){
    requestScreenWakeLock();
  }
});

// Activar Wake Lock con la primera interacción del usuario
window.addEventListener('pointerdown', requestScreenWakeLock, { passive: true, once: true });
window.addEventListener('touchstart', requestScreenWakeLock, { passive: true, once: true });

// Inicializar cuando el DOM esté listo
if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', function(){
    initApp();
    requestScreenWakeLock();
  });
} else {
  initApp();
  requestScreenWakeLock();
}
