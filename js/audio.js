/* ==========================================================================
   EASY PIANO 3.0 · MÓDULO 2: MOTOR WEB AUDIO HI-FI & SÍNTESIS ACÚSTICA
   js/audio.js
   ========================================================================== */

var AC = null, master = null, masterAnalyser = null;
var synthScopeBuf = null;
var _unlockedAudio = false;

function ensureAudio(){
  if(!AC){
    var Ctx = window.AudioContext || window.webkitAudioContext;
    if(!Ctx) return false;
    AC = new Ctx();
    master = AC.createGain();
    master.gain.value = settings.vol;
    
    // Analizador para el Osciloscopio del sintetizador
    masterAnalyser = AC.createAnalyser();
    masterAnalyser.fftSize = 2048;
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

// Desbloqueo universal de AudioContext para dispositivos táctiles (iOS / Android)
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

/* Síntesis de Sonido de Piano Acústico Enriquecido */
function playSound(m, vel){
  if(!AC) return;
  var f = 440 * Math.pow(2, (m - 69) / 12), t = AC.currentTime;
  var dec = Math.max(1.2, 2.8 - (m - 60) * 0.08); // Rango de decaimiento natural
  
  var env = AC.createGain();
  env.gain.setValueAtTime(0, t);
  env.gain.linearRampToValueAtTime(0.42 * vel, t + 0.005);
  env.gain.exponentialRampToValueAtTime(0.0001, t + dec);
  
  var lp = AC.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.setValueAtTime(Math.min(f * 12, 14000), t);
  lp.frequency.exponentialRampToValueAtTime(Math.max(f * 1.5, 320), t + dec * 0.75);
  
  env.connect(lp);
  lp.connect(master);
  
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
    
    o.connect(og);
    og.connect(env);
    o.start(t);
    o.stop(t + dec + 0.2);
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
    osc.connect(gain);
    gain.connect(master);
    
    if(type === 'click'){
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, t);
      osc.frequency.exponentialRampToValueAtTime(320, t + 0.04);
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
      osc.start(t);
      osc.stop(t + 0.05);
    } else if(type === 'victory'){
      [523.25, 659.25, 783.99, 1046.50].forEach(function(freq, idx){
        var o = AC.createOscillator();
        var g = AC.createGain();
        o.type = 'triangle';
        o.frequency.value = freq;
        g.gain.setValueAtTime(0, t + idx * 0.08);
        g.gain.linearRampToValueAtTime(0.2, t + idx * 0.08 + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t + idx * 0.08 + 0.6);
        o.connect(g);
        g.connect(master);
        o.start(t + idx * 0.08);
        o.stop(t + idx * 0.08 + 0.7);
      });
    }
  }catch(e){}
}

/* ============ GRABADORA DE INTERPRETACIONES FAMILIARES ============ */
var _familyRecorder = null;
var _familyChunks = [];
var _isFamilyRecording = false;
var _familyRecDestination = null;
var _familyAudioUrl = null;

function startFamilyRecording(){
  if(!ensureAudio()) return false;
  try {
    if(!_familyRecDestination){
      _familyRecDestination = AC.createMediaStreamDestination();
      if(master) master.connect(_familyRecDestination);
    }
    _familyChunks = [];
    var mime = (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported('audio/webm')) ? 'audio/webm' : '';
    var opt = mime ? { mimeType: mime } : undefined;
    _familyRecorder = new MediaRecorder(_familyRecDestination.stream, opt);
    _familyRecorder.ondataavailable = function(e){
      if(e.data && e.data.size > 0) _familyChunks.push(e.data);
    };
    _familyRecorder.onstop = function(){
      var blob = new Blob(_familyChunks, { type: mime || 'audio/wav' });
      if(_familyAudioUrl) URL.revokeObjectURL(_familyAudioUrl);
      _familyAudioUrl = URL.createObjectURL(blob);
      openPlaybackModal(_familyAudioUrl);
    };
    _familyRecorder.start();
    _isFamilyRecording = true;
    updateFamilyRecButtons(true);
    toast('🔴 ¡Grabando lo que toques al piano! 🎹');
    return true;
  } catch(e){
    toast('⚠ Grabación no compatible en este navegador.');
    return false;
  }
}

function stopFamilyRecording(){
  if(_familyRecorder && _isFamilyRecording){
    try{ _familyRecorder.stop(); }catch(e){}
    _isFamilyRecording = false;
    updateFamilyRecButtons(false);
  }
}

function toggleFamilyRecording(){
  if(_isFamilyRecording) stopFamilyRecording();
  else startFamilyRecording();
}

function updateFamilyRecButtons(isRec){
  var btn1 = document.getElementById('familyRecBtn');
  var btn2 = document.getElementById('recBtn');
  var txt = isRec ? '⏹ Detener y Escuchar' : '🎙️ Grabar mi canción';
  if(btn1){ btn1.textContent = txt; if(isRec) btn1.classList.add('recPulse'); else btn1.classList.remove('recPulse'); }
  if(btn2 && btn2.id === 'recBtn' && typeof isRecording !== 'undefined' && isRecording){ /* mantener grabador libre */ }
}

function openPlaybackModal(url){
  var m = document.getElementById('playbackModal');
  var audio = document.getElementById('familyPlaybackAudio');
  if(!m) return;
  if(audio) audio.src = url;
  m.hidden = false;
  try{ if(typeof playUiSound === 'function') playUiSound('victory'); }catch(e){}
}
