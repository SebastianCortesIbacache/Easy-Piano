/* ==========================================================================
   PIANOFÁCIL PRO · MÓDULO 4: TECLADO ACÚSTICO PROPORCIONAL & EVENTOS TÁCTILES
   PianoFácil PRO · js/piano.js
   ========================================================================== */

var piano = $('#piano'), keyEls = {};
var BLACK = [1, 3, 6, 8, 10];

// Offsets acústicos estándar para dejar espacio uniforme a los dedos en las teclas blancas
var BLACK_OFFSETS = {
  1: -0.07, // C# ligeramente a la izquierda
  3: +0.07, // D# ligeramente a la derecha
  6: -0.08, // F# ligeramente a la izquierda
  8:  0.00, // G# centrado
  10: +0.08 // A# ligeramente a la derecha
};

function rebuildPiano(){
  keyEls = {};
  var pianoEl = document.getElementById('piano');
  if(!pianoEl) return;
  pianoEl.innerHTML = '';
  pianoEl.style.width = '100%';
  pianoEl.style.transform = '';
  pianoEl.style.position = 'relative';
  pianoEl.style.display = 'flex';

  var whiteIdx = {}, whiteCount = 0;
  for(var m0 = FIRST; m0 <= LAST; m0++){
    if(BLACK.indexOf(m0 % 12) < 0){
      whiteIdx[m0] = whiteCount;
      whiteCount++;
    }
  }

  // 1. Crear Teclas Blancas continuas (Flex 1, marfil adyacente sin huecos)
  for(var m1 = FIRST; m1 <= LAST; m1++){
    if(BLACK.indexOf(m1 % 12) >= 0) continue;
    (function(m){
      var el = document.createElement('div');
      el.className = 'key white';
      var nm = document.createElement('span');
      nm.className = 'kname';
      el.appendChild(nm);
      var kh = document.createElement('span');
      kh.className = 'khint';
      kh.textContent = (MIDITOKEY[m] || '').toUpperCase();
      el.appendChild(kh);
      pianoEl.appendChild(el);
      keyEls[m] = el;
      attachPianoKeyEvents(el, m);
    })(m1);
  }

  // 2. Crear Teclas Negras (Ébano acústico esbelto, 52% de ancho y offsets naturales)
  var wPct = 100 / whiteCount;
  var bPct = wPct * 0.52; // Proporción esbelta y realista
  for(var m2 = FIRST; m2 <= LAST; m2++){
    if(BLACK.indexOf(m2 % 12) < 0) continue;
    (function(m){
      var el = document.createElement('div');
      el.className = 'key black';
      var kh = document.createElement('span');
      kh.className = 'khint';
      kh.textContent = (MIDITOKEY[m] || '').toUpperCase();
      el.appendChild(kh);

      var pc = m % 12;
      var offset = BLACK_OFFSETS[pc] || 0;
      var leftCenterPct = (whiteIdx[m - 1] + 1 + offset) * wPct;

      el.style.position = 'absolute';
      el.style.left = leftCenterPct + '%';
      el.style.width = bPct + '%';
      el.style.marginLeft = (-bPct / 2) + '%';
      el.style.top = '0';
      el.style.height = '56%';
      el.style.zIndex = '8';

      pianoEl.appendChild(el);
      keyEls[m] = el;
      attachPianoKeyEvents(el, m);
    })(m2);
  }

  refreshLabels();
  try{ clearHints(); clearErrors(); }catch(e){}
  setTimeout(function(){ ensureKeyVisible(60); }, 60);
}

function attachPianoKeyEvents(el, m){
  if(window.PointerEvent){
    el.addEventListener('pointerdown', function(ev){
      if(ev.cancelable) ev.preventDefault();
      try{ el.releasePointerCapture(ev.pointerId); }catch(e){}
      el._downPid = ev.pointerId;
      triggerNote(m, false);
    });
    el.addEventListener('pointerenter', function(ev){
      if(ev.buttons && (ev.buttons & 1) && ev.pointerId !== el._downPid) triggerNote(m, false);
    });
    el.addEventListener('pointerup', function(ev){
      if(ev.pointerId === el._downPid) el._downPid = -1;
    });
  }else{
    el.addEventListener('mousedown', function(ev){
      if(ev.cancelable) ev.preventDefault();
      triggerNote(m, false);
    });
    el.addEventListener('touchstart', function(ev){
      ev.preventDefault();
      triggerNote(m, false);
    }, { passive: false });
  }
  el.addEventListener('contextmenu', function(ev){ ev.preventDefault(); });
}

// Limpieza global de estados táctiles para que ninguna tecla quede pegada
function clearAllDownStates(){
  try{
    for(var k in keyEls){
      if(!keyEls.hasOwnProperty(k)) continue;
      var el = keyEls[k];
      if(!el) continue;
      try{ el.classList.remove('down'); }catch(e){}
      try{ clearTimeout(el._t); }catch(e){}
      el._downPid = -1;
    }
  }catch(e){}
}

window.addEventListener('pointerup', clearAllDownStates);
window.addEventListener('pointercancel', clearAllDownStates);
window.addEventListener('mouseup', clearAllDownStates);
window.addEventListener('touchend', clearAllDownStates);
window.addEventListener('touchcancel', clearAllDownStates);
document.addEventListener('visibilitychange', function(){ if(document.hidden) clearAllDownStates(); });

var _kbdResizeTimer = null;
window.addEventListener('resize', function(){
  clearTimeout(_kbdResizeTimer);
  _kbdResizeTimer = setTimeout(function(){ try{ rebuildPiano(); }catch(e){} }, 120);
});

function refreshLabels(){
  for(var m = FIRST; m <= LAST; m++){
    var el = keyEls[m]; if(!el) continue;
    var nm = el.querySelector('.kname');
    if(nm){
      var pc = midiToPC(m);
      nm.textContent = settings.sys === 'solfege' ? SOL[pc] : pc;
      nm.style.display = settings.names ? '' : 'none';
    }
    var kh = el.querySelector('.khint');
    if(kh) kh.style.display = settings.hints ? '' : 'none';
  }
}

/* ============ DISPARO DE NOTAS & EFECTOS VISUALES ============ */
var _lastNoteMidi = null, _lastNoteTime = 0;
function triggerNote(m, silent, internal){
  var now = performance.now();
  if(!internal && m === _lastNoteMidi && (now - _lastNoteTime) < 100) return;
  _lastNoteMidi = m; _lastNoteTime = now;
  if(practice && practice.intro && !internal) return;
  if(!silent){ ensureAudio(); playSound(m, 1); }
  flash(m);
  if(typeof recordEvent === 'function') recordEvent(m);
  if(typeof judge === 'function') judge(m);
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

  var rip = document.createElement('i'); rip.className = 'keyRipple';
  rip.style.left = x + 'px'; rip.style.top = y + 'px';
  fx.appendChild(rip);
  rip.addEventListener('animationend', function(){ this.remove(); });

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

// Indicadores neón y flechas
function clearHints(){ for(var k in keyEls) keyEls[k].classList.remove('hint'); }
function clearErrors(){ for(var k in keyEls) keyEls[k].classList.remove('err'); }

function ensureKeyVisible(m){
  try{
    var wrap = document.getElementById('pianoWrap');
    var el = keyEls[m];
    if(!wrap || !el) return;
    if(wrap.scrollWidth > wrap.clientWidth){
      var elLeft = el.offsetLeft;
      var elWidth = el.offsetWidth || 30;
      var wrapWidth = wrap.clientWidth;
      var target = elLeft - (wrapWidth / 2) + (elWidth / 2);
      wrap.scrollTo({ left: Math.max(0, target), behavior: 'smooth' });
    }
  }catch(e){}
}

function positionArrow(el){
  var pianoWrap = $('#pianoWrap'); if(!pianoWrap) return;
  var r = el.getBoundingClientRect(), w = pianoWrap.getBoundingClientRect();
  var a = $('#hintArrow'); if(!a) return;
  a.style.opacity = '1'; a.style.left = (r.left + r.width / 2 - w.left) + 'px';
  if(lastHintMidi) ensureKeyVisible(lastHintMidi);
}
function hideArrow(){ var a = $('#hintArrow'); if(a) a.style.opacity = '0'; lastHintMidi = null; }

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

function animateNeonHint(midi){
  try{
    var wrap = document.getElementById('pianoWrap'); if(!wrap) return;
    ensureKeyVisible(midi);
    var neon = document.getElementById('neonHint');
    if(!neon){ neon = document.createElement('div'); neon.id = 'neonHint'; neon.className = 'neonHint'; neon.style.position = 'absolute'; wrap.appendChild(neon); }
    var el = keyEls[midi];
    if(!el){ try{ clearTimeout(neon._h); neon.style.opacity = '0'; }catch(e){} return; }
    var r = el.getBoundingClientRect(), w = wrap.getBoundingClientRect();
    var leftPx = Math.round(r.left + r.width/2 - w.left - (neon.offsetWidth ? neon.offsetWidth/2 : 24));
    var topPx = Math.round(r.top - w.top - 18);
    neon.style.left = leftPx + 'px';
    neon.style.top = topPx + 'px';
    neon.style.opacity = '1';
    neon.classList.remove('neonPulse'); void neon.offsetWidth; neon.classList.add('neonPulse');
    try{ clearTimeout(neon._h); }catch(e){}
    neon._h = setTimeout(function(){ try{ neon.style.opacity = '0'; }catch(e){} }, 1200);
  }catch(e){}
}

if(typeof window !== 'undefined'){
  window.addEventListener('DOMContentLoaded', function(){
    var btnL = document.getElementById('pianoNavLeft');
    var btnR = document.getElementById('pianoNavRight');
    var pw = document.getElementById('pianoWrap');
    if(btnL && pw){
      btnL.addEventListener('click', function(e){
        e.stopPropagation();
        pw.scrollBy({ left: -180, behavior: 'smooth' });
      });
    }
    if(btnR && pw){
      btnR.addEventListener('click', function(e){
        e.stopPropagation();
        pw.scrollBy({ left: 180, behavior: 'smooth' });
      });
    }
  });
}
