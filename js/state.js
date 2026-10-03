/* ==========================================================================
   PIANOFÁCIL PRO · MÓDULO 1: ESTADO GLOBAL, PERSISTENCIA Y GAMIFICACIÓN
   PianoFácil PRO · js/state.js
   ========================================================================== */

window.addEventListener('error', function(e){
  var b = document.getElementById('errBanner');
  if(b){ b.style.display = 'block'; b.textContent = '⚠ Error: ' + (e.message || e); }
});

/* ============ ALMACENAMIENTO LOCAL ============ */
function storeGet(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } }
function storeSet(k,v){ try{ localStorage.setItem(k,v); }catch(e){} }
function storeGetJson(k, defVal){
  try {
    var item = localStorage.getItem(k);
    return item ? JSON.parse(item) : (defVal || null);
  } catch(e){
    return defVal || null;
  }
}
function storeSetJson(k, val){
  try {
    localStorage.setItem(k, JSON.stringify(val));
  } catch(e){}
}

/* ============ HELPER DOM ============ */
function $(sel){ return document.querySelector(sel); }
function $$(sel){ return document.querySelectorAll(sel); }

/* ============ AJUSTES DE CONFIGURACIÓN ============ */
var settings = { vol: 0.8, sys: 'solfege', names: true, hints: true, staffNames: true, waitMode: false, synthesia: false };
try{
  var sv = JSON.parse(storeGet('pf_settings') || '{}');
  for(var sk in sv) settings[sk] = sv[sk];
}catch(e){}
function saveSettings(){ storeSet('pf_settings', JSON.stringify(settings)); }

/* ============ NOTIFICACIONES TOAST & BIGMSG ============ */
function toast(txt){
  var t = $('#toast'); if(!t) return;
  t.textContent = txt; t.classList.add('show');
  clearTimeout(t._h); t._h = setTimeout(function(){ t.classList.remove('show'); }, 1400);
}

var msgTimer = null;
var _onDoneMsgCallback = null;

function showMsg(text, ms, onDone){
  var el = $('#bigMsg'); if(!el) return;
  el.innerHTML = text;
  el.classList.add('show');
  clearTimeout(msgTimer);
  _onDoneMsgCallback = onDone || null;
  var duration = Math.min(ms || 1400, 1600); // Acortado en tiempo
  msgTimer = setTimeout(function(){
    el.classList.remove('show');
    if(_onDoneMsgCallback){
      var cb = _onDoneMsgCallback;
      _onDoneMsgCallback = null;
      setTimeout(cb, 120);
    }
  }, duration);
}

function hideMsgNow(){
  clearTimeout(msgTimer);
  var el = $('#bigMsg'); if(el) el.classList.remove('show');
  if(_onDoneMsgCallback){
    var cb = _onDoneMsgCallback;
    _onDoneMsgCallback = null;
    cb();
  }
}

if(typeof window !== 'undefined'){
  window.addEventListener('DOMContentLoaded', function(){
    var bm = document.getElementById('bigMsg');
    if(bm) bm.addEventListener('click', function(){ hideMsgNow(); });
  });
}

/* ============ FRASES MOTIVACIONALES DEL AVATAR ============ */
var AVATAR_TIPS = [
  '¡Hola! Tu familia y amigos están súper orgullosos de ti 💛',
  '¡Vamos, tú eres el verdadero maestro del piano! 🎹✨',
  '¡Todos van a aplaudir de pie cuando escuchen esta melodía! 👏🌟',
  '¡Qué lindo sonido! A todos les encantará cómo tocas 🎶',
  'Recuerda curvar tus dedos como garras de superhéroe 🦸',
  '¡Cada día suenas mejor! Eres un verdadero concertista 🌟',
  '¡Paso a pasito, como las tortuguitas sabias! 🐢',
  '¡Qué talento tienes! Vamos por esas 3 estrellas ⭐⭐⭐',
  '¡A tus amigos y familia les encantará que les enseñes esta canción! 🎶',
  '¡Vas a tocar el piano como todo un profesional! 😎🚀',
  'Respira profundo, relaja tus muñecas y disfruta la música 🌬️🎹',
  '¡Tus manitos tienen superpoderes musicales! ⚡',
  '¡La música es pura diversión! ¡A brillar en el teclado! 🌈',
  '¡Manos en forma de garrita, como sosteniendo una pelotita mágica! 🎾'
];
var MATEO_AVATAR_TIPS = AVATAR_TIPS;

/* ============ RUTA Y PROGRESO DEL CURSO ============ */
function getPath(){ try{ return JSON.parse(storeGet('pf_path') || '{}'); }catch(e){ return {}; } }
function stageLocked(s, prog){
  if(s === 1) return false;
  return !stageDoneIn(prog, s - 1);
}
function nextLevelFor(prog){
  if(typeof LEVELS === 'undefined') return null;
  for(var i = 0; i < LEVELS.length; i++){
    var lv = LEVELS[i];
    if((prog[lv.id] || 0) > 0) continue;
    if(stageLocked(lv.stage, prog)) continue;
    if(i > 0 && (prog[LEVELS[i - 1].id] || 0) === 0) continue;
    return lv;
  }
  return null;
}
function findNextLevelToMaster(prog){
  if(typeof LEVELS === 'undefined') return null;
  for(var i = 0; i < LEVELS.length; i++){
    var lv = LEVELS[i];
    if((prog[lv.id] || 0) < 3 && !stageLocked(lv.stage, prog)){
      return lv;
    }
  }
  return null;
}
function continueLevel(prog){
  if(typeof LEVELS === 'undefined') return null;
  var lastId = parseInt(storeGet('pf_last') || '0', 10);
  var last = null;
  if(lastId) last = LEVELS.filter(function(l){ return l.id === lastId; })[0] || null;
  if(last && (prog[last.id] || 0) === 0 && !stageLocked(last.stage, prog)){
    var idx = LEVELS.indexOf(last);
    if(idx === 0 || (prog[LEVELS[idx - 1].id] || 0) > 0) return last;
  }
  var next = nextLevelFor(prog);
  if(next) return next;
  return findNextLevelToMaster(prog);
}

function renderBadges(){
  var prog = getPath();
  if(typeof earnedBadges !== 'function' || typeof BADGES === 'undefined') return;
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

/* ============ ESTADÍSTICAS DIARIAS Y TIEMPO ============ */
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
  
  var totalTodaySec = d.history[todayStr] || 0;
  try{ addMissionProgress('time', totalTodaySec / 60); }catch(e){}

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
  updateMissionsBadge();
}

/* ============ MISIONES DIARIAS ============ */
function getTodayDateStr(){
  var today = new Date();
  return new Date(today.getTime() - (today.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
}

function getDailyMissions(){
  var key = 'pf_missions_' + getTodayDateStr();
  var m = storeGetJson(key, null);
  if(!m){
    m = {
      date: getTodayDateStr(),
      songsTarget: 2,
      songsDone: 0,
      starsTarget: 5,
      starsDone: 0,
      timeTargetMin: 5,
      timeDoneMin: 0,
      claimed: false
    };
    storeSetJson(key, m);
  }
  return m;
}

function saveDailyMissions(m){
  if(m && m.date) storeSetJson('pf_missions_' + m.date, m);
  updateMissionsBadge();
}

function addMissionProgress(type, amount){
  var m = getDailyMissions();
  if(type === 'songs') m.songsDone += (amount || 1);
  if(type === 'stars') m.starsDone += (amount || 1);
  if(type === 'time') m.timeDoneMin = Math.floor(amount || 0);
  saveDailyMissions(m);
}

function areMissionsComplete(m){
  return (m.songsDone >= m.songsTarget && m.starsDone >= m.starsTarget && m.timeDoneMin >= m.timeTargetMin);
}

function updateMissionsBadge(){
  var m = getDailyMissions();
  var btn = document.getElementById('missionsBtn');
  if(!btn) return;
  var countDone = (m.songsDone >= m.songsTarget ? 1 : 0) + 
                  (m.starsDone >= m.starsTarget ? 1 : 0) + 
                  (m.timeDoneMin >= m.timeTargetMin ? 1 : 0);
  if(m.claimed){
    btn.innerHTML = '🎯 Misiones <span class="chipCount">🏆 Hecho</span>';
  } else if(countDone === 3){
    btn.innerHTML = '🎯 Misiones <span class="chipCount glow">🎁 ¡Listo!</span>';
  } else {
    btn.innerHTML = '🎯 Misiones <span class="chipCount">' + countDone + '/3</span>';
  }
}

function renderMissionsModal(){
  var m = getDailyMissions();
  var p1 = document.getElementById('mSongProg');
  var p2 = document.getElementById('mStarProg');
  var p3 = document.getElementById('mTimeProg');
  var bar1 = document.getElementById('mSongBar');
  var bar2 = document.getElementById('mStarBar');
  var bar3 = document.getElementById('mTimeBar');
  var claimBtn = document.getElementById('claimMissionsBtn');

  if(p1) p1.textContent = Math.min(m.songsDone, m.songsTarget) + ' / ' + m.songsTarget + ' canciones';
  if(p2) p2.textContent = Math.min(m.starsDone, m.starsTarget) + ' / ' + m.starsTarget + ' estrellas ⭐';
  if(p3) p3.textContent = Math.min(m.timeDoneMin, m.timeTargetMin) + ' / ' + m.timeTargetMin + ' min ⏱';

  if(bar1) bar1.style.width = Math.min(100, (m.songsDone / m.songsTarget) * 100) + '%';
  if(bar2) bar2.style.width = Math.min(100, (m.starsDone / m.starsTarget) * 100) + '%';
  if(bar3) bar3.style.width = Math.min(100, (m.timeDoneMin / m.timeTargetMin) * 100) + '%';

  if(claimBtn){
    if(m.claimed){
      claimBtn.disabled = true;
      claimBtn.textContent = '✅ ¡Recompensa Reclamada Hoy!';
      claimBtn.className = 'btn ghost';
    } else if(areMissionsComplete(m)){
      claimBtn.disabled = false;
      claimBtn.textContent = '🎁 ¡Abrir Cofre de Recompensas!';
      claimBtn.className = 'btn';
    } else {
      claimBtn.disabled = true;
      claimBtn.textContent = '🔒 Completa las 3 misiones de hoy';
      claimBtn.className = 'btn ghost';
    }
  }
}

function claimMissionsReward(){
  var m = getDailyMissions();
  if(!areMissionsComplete(m) || m.claimed) return;
  m.claimed = true;
  saveDailyMissions(m);
  renderMissionsModal();
  try{
    if(typeof playUiSound === 'function') playUiSound('victory');
    if(typeof fireConfetti === 'function') fireConfetti();
    if(typeof setAvatarState === 'function') setAvatarState('victory', '🎉 ¡Completaste todas las misiones de hoy! ¡Eres un crack! 🌟', 3000);
  }catch(e){}
  toast('🏆 ¡Cofre diario abierto! +50 Puntos de Maestro de Piano');
}

/* ============ PAUSAS INTELIGENTES (CUIDADO DE MANOS) ============ */
var sessionContinuousSec = 0;
var pauseModalShown = false;

setInterval(function(){
  if(typeof practice !== 'undefined' && practice && practice.active){
    sessionContinuousSec += 5;
    if(sessionContinuousSec >= 900 && !pauseModalShown){ // 15 minutos continuos
      pauseModalShown = true;
      var m = document.getElementById('stretchPauseModal');
      if(m){
        m.hidden = false;
        try{ if(typeof playUiSound === 'function') playUiSound('victory'); }catch(e){}
      }
    }
  } else {
    sessionContinuousSec = Math.max(0, sessionContinuousSec - 1);
  }
}, 5000);

/* ============ MODO NIÑO ============ */
var _kidModeStored = storeGet('pf_kid_mode');
var _kidMode = (_kidModeStored !== '0'); // Activo por defecto

function setKidMode(active, showToast){
  _kidMode = active;
  storeSet('pf_kid_mode', _kidMode ? '1' : '0');
  var kp = document.getElementById('kidPathMini');
  var pv = document.getElementById('pathView');
  var kidBtn = document.getElementById('kidModeBtn');
  
  if(_kidMode){
    document.body.classList.add('kid-mode');
    if(kidBtn) kidBtn.textContent = '🧸 Modo Niño ✓';
    if(kp) kp.hidden = false;
    if(pv) pv.hidden = true;
    if(typeof renderKidPathMini === 'function') renderKidPathMini();
  } else {
    document.body.classList.remove('kid-mode');
    if(kidBtn) kidBtn.textContent = '🧸 Modo Niño';
    if(kp) kp.hidden = true;
    if(pv) pv.hidden = false;
  }
  if(typeof ensureKidMicButton === 'function') ensureKidMicButton(_kidMode);
  if(typeof rebuildPiano === 'function'){ try{ rebuildPiano(); }catch(e){} }
  if(showToast) toast(_kidMode ? 'Modo Niño activado 🧸' : 'Modo Niño desactivado');
}
