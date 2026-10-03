/* ==========================================================================
   PIANOFÁCIL PRO · MÓDULO 7: MOTOR PEDAGÓGICO DE APRENDIZAJE & PRÁCTICA
   PianoFácil PRO · js/practice.js
   ========================================================================== */

var practice = { active: false, level: null, idx: 0, hits: 0, misses: 0, streak: 0, bestStreak: 0, demo: false, intro: false, lastTouchT: 0 };
var lastHintMidi = null, demoRun = 0;
function needsListenMsg(lv){ return (lv.stage === 1 && lv.id <= 2) || !!lv.song; }

/* ============ PARTITURA SVG DINÁMICA 2.0 (COMPÁS & LECTURA REAL) ============ */
function diatonic(m){
  var pc = ((m % 12) + 12) % 12, oct = Math.floor(m / 12) - 1;
  var letter = [0, 0, 1, 1, 2, 3, 3, 4, 4, 5, 5, 6][pc];
  return oct * 7 + letter;
}

function getStaffNoteY(midi, isBass){
  var pc = ((midi % 12) + 12) % 12, oct = Math.floor(midi / 12) - 1;
  var deg = [0, 0, 1, 1, 2, 3, 3, 4, 4, 5, 5, 6][pc];
  var diatonicVal = oct * 7 + deg;
  var ref = isBass ? 18 : 30;
  var step = diatonicVal - ref;
  return 70 - step * 5;
}

function renderStaff(container, note, showName, notesList, activeIndex){
  if(!container || !note) return;

  var lv = (practice && practice.level) ? practice.level : null;
  var isBass = (lv && lv.handAll === 'I') || (note.midi < 60);
  var clefChar = isBass ? '𝄢' : '𝄞';
  var clefFontSize = isBass ? '48' : '58';
  var clefY = isBass ? '66' : '78';

  var s = '<svg viewBox="0 0 280 120" width="270" height="116" class="staffSvg">';
  s += '<defs>';
  s += '  <linearGradient id="cGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#3ddc84"/><stop offset="100%" stop-color="#24a85f"/></linearGradient>';
  s += '  <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#ffb547"/><stop offset="100%" stop-color="#ff8038"/></linearGradient>';
  s += '  <filter id="neonGlow"><feGaussianBlur stdDeviation="3.5" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>';
  s += '</defs>';

  // 5 líneas del pentagrama
  for(var i = 0; i < 5; i++){
    s += '<line x1="12" y1="' + (30 + i * 10) + '" x2="268" y2="' + (30 + i * 10) + '" stroke="#6a7089" stroke-width="1.4"/>';
  }
  // Barra final del compás
  s += '<line x1="268" y1="30" x2="268" y2="70" stroke="#6a7089" stroke-width="1.8"/>';

  // Clave musical
  s += '<text x="12" y="' + clefY + '" font-size="' + clefFontSize + '" fill="#cdd2e4" font-family="serif" style="user-select:none;">' + clefChar + '</text>';

  // Compás 4/4 o 3/4
  var timeSig = (lv && lv.timeSig) ? lv.timeSig : '4/4';
  var num = timeSig.charAt(0) || '4', den = timeSig.charAt(2) || '4';
  s += '<text x="44" y="48" font-size="19" font-weight="900" fill="#a4adca" font-family="Outfit,sans-serif">' + num + '</text>';
  s += '<text x="44" y="68" font-size="19" font-weight="900" fill="#a4adca" font-family="Outfit,sans-serif">' + den + '</text>';

  // Determinar notas a dibujar: compás deslizante de hasta 4 notas
  var drawList = [];
  if(Array.isArray(notesList) && typeof activeIndex === 'number' && notesList.length > 0){
    var startIdx = Math.max(0, activeIndex - (activeIndex > 0 ? 1 : 0));
    var endIdx = Math.min(notesList.length, startIdx + 4);
    if(endIdx - startIdx < 4 && startIdx > 0){
      startIdx = Math.max(0, endIdx - 4);
    }
    var slotX = [84, 134, 184, 234];
    for(var k = startIdx; k < endIdx; k++){
      drawList.push({
        note: notesList[k],
        idx: k,
        x: slotX[k - startIdx],
        isCurrent: (k === activeIndex),
        isPast: (k < activeIndex),
        isFuture: (k > activeIndex)
      });
    }
  }else{
    drawList.push({
      note: note,
      idx: 0,
      x: 154,
      isCurrent: true,
      isPast: false,
      isFuture: false
    });
  }

  for(var d = 0; d < drawList.length; d++){
    var item = drawList[d];
    var n = item.note, nx = item.x;
    var ny = getStaffNoteY(n.midi, isBass);
    var dur = n.dur || 1;
    var hollow = (dur >= 2), hasStem = (dur < 4), isEighth = (dur < 1);
    var sharp = midiToPC(n.midi).indexOf('#') >= 0;

    var color = item.isCurrent ? '#3ddc84' : (item.isPast ? '#64748b' : '#ffb547');
    var grad = item.isCurrent ? 'url(#cGrad)' : (item.isPast ? '#64748b' : 'url(#goldGrad)');

    if(item.isCurrent){
      s += '<line class="staffCursor" x1="' + nx + '" y1="18" x2="' + nx + '" y2="92" stroke="' + grad + '" stroke-width="2.5" stroke-dasharray="4 2"/>';
    }

    if(!isBass){
      if(ny >= 80){
        for(var ly = 80; ly <= ny; ly += 10){
          s += '<line x1="' + (nx - 13) + '" y1="' + ly + '" x2="' + (nx + 13) + '" y2="' + ly + '" stroke="#6a7089" stroke-width="1.4"/>';
        }
      }else if(ny <= 20){
        for(var hy = 20; hy >= ny; hy -= 10){
          s += '<line x1="' + (nx - 13) + '" y1="' + hy + '" x2="' + (nx + 13) + '" y2="' + hy + '" stroke="#6a7089" stroke-width="1.4"/>';
        }
      }
    }else{
      if(ny <= 20){
        for(var bly = 20; bly >= ny; bly -= 10){
          s += '<line x1="' + (nx - 13) + '" y1="' + bly + '" x2="' + (nx + 13) + '" y2="' + bly + '" stroke="#6a7089" stroke-width="1.4"/>';
        }
      }else if(ny >= 80){
        for(var bhy = 80; bhy <= ny; bhy += 10){
          s += '<line x1="' + (nx - 13) + '" y1="' + bhy + '" x2="' + (nx + 13) + '" y2="' + bhy + '" stroke="#6a7089" stroke-width="1.4"/>';
        }
      }
    }

    if(sharp){
      s += '<text x="' + (nx - 17) + '" y="' + (ny + 6) + '" font-size="16" fill="' + color + '" font-family="serif">♯</text>';
    }

    var stemUp = (ny >= 50);
    if(hasStem){
      var stemX = stemUp ? (nx + 6.5) : (nx - 6.5);
      var stemY1 = stemUp ? (ny - 2) : (ny + 2);
      var stemY2 = stemUp ? (ny - 34) : (ny + 34);
      s += '<line x1="' + stemX + '" y1="' + stemY1 + '" x2="' + stemX + '" y2="' + stemY2 + '" stroke="' + color + '" stroke-width="2.2"/>';

      if(isEighth){
        if(stemUp){
          s += '<path d="M ' + stemX + ' ' + stemY2 + ' q 10 5 6 18" stroke="' + color + '" stroke-width="2.6" fill="none"/>';
        }else{
          s += '<path d="M ' + stemX + ' ' + stemY2 + ' q 10 -5 6 -18" stroke="' + color + '" stroke-width="2.6" fill="none"/>';
        }
      }
    }

    var headFilter = item.isCurrent ? 'filter="url(#neonGlow)"' : '';
    s += '<ellipse cx="' + nx + '" cy="' + ny + '" rx="7.5" ry="5.5" transform="rotate(-18 ' + nx + ' ' + ny + ')" ' +
         (hollow ? ('fill="#181c2d" stroke="' + color + '" stroke-width="2.2"') : ('fill="' + grad + '"')) +
         ' ' + headFilter + '/>';

    if(item.isPast){
      s += '<text x="' + nx + '" y="' + (ny - 12) + '" text-anchor="middle" fill="#3ddc84" font-size="10" font-weight="900">✓</text>';
    }

    if(showName){
      var pc2 = midiToPC(n.midi);
      var label = (settings && settings.sys === 'solfege') ? SOL[pc2] : pc2;
      var lblColor = item.isCurrent ? '#3ddc84' : (item.isPast ? '#8892b0' : '#ffb547');
      var lblWeight = item.isCurrent ? '900' : '700';
      var lblSize = item.isCurrent ? '13' : '11';
      s += '<text x="' + nx + '" y="112" text-anchor="middle" fill="' + lblColor + '" font-size="' + lblSize + '" font-family="Outfit,sans-serif" font-weight="' + lblWeight + '">' + label + midiToOct(n.midi) + '</text>';
    }
  }

  s += '</svg>';
  container.innerHTML = s;
}

/* ============ GUÍAS DE MANOS Y POSTURA ============ */
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

function loadHandGuideForLevel(lv){
  var slot = document.getElementById('handGuideImgSlot');
  if(!slot) return;
  slot.innerHTML = '';
  slot.hidden = true;

  if(!lv || !lv.ui || !lv.ui.handGuide) return;

  var guideName = lv.ui.handGuide;
  var candidates = [
    'assets/hand_guides/' + guideName,
    'www/assets/hand_guides/' + guideName,
    guideName
  ];

  (function tryNext(i){
    if(i >= candidates.length) return;
    var url = candidates[i];
    var img = new Image();
    img.src = url + '?v=2';
    img.onload = function(){
      slot.innerHTML = '';
      img.className = 'handGuideImg';
      img.title = 'Guía de postura en primera persona (POV)';
      img.alt = 'Guía POV';
      slot.appendChild(img);
      slot.hidden = false;
    };
    img.onerror = function(){ tryNext(i + 1); };
  })(0);
}

/* ============ PRÁCTICA DE LECCIONES ============ */
function startPractice(lv){
  if(typeof setMode === 'function') setMode('learn');
  demoRun++;
  if(typeof stopRecorderPlayback === 'function') stopRecorderPlayback();
  hideMsgNow();
  document.body.classList.add('in-practice');
  practice = { active: true, level: lv, idx: 0, hits: 0, misses: 0, streak: 0, bestStreak: 0, demo: false, intro: true, lastTouchT: performance.now() };
  storeSet('pf_last', String(lv.id));
  $('#pathView').hidden = true; $('#practice').hidden = false;
  $('#pracName').textContent = lv.emoji + ' ' + lv.title;
  $('#pracLvl').textContent = 'Nivel ' + lv.id + ' de ' + LEVELS.length + ' · ' + STAGES[lv.stage - 1].title;
  $('#demoBtn').textContent = '▶ Escuchar';
  if($('#skipIntroBtn')) $('#skipIntroBtn').hidden = false;
  
  var lessonBox = $('#lessonBox');
  var lessonToggle = $('#lessonToggle');
  if(lv.lesson){
    lessonBox.hidden = false;
    lessonBox.innerHTML = '💡 ' + lv.lesson;
    if(lessonToggle){
      lessonToggle.hidden = true;
      lessonToggle.setAttribute('aria-expanded', 'false');
      lessonToggle.textContent = '💡 Ver consejo';
    }
  } else {
    lessonBox.hidden = true;
    if(lessonToggle) lessonToggle.hidden = true;
  }
  var ui = lv.ui || {};
  $('#teachRow').hidden = !(ui.hand || ui.score);
  $('#handCard').hidden = !ui.hand;
  $('#staffCard').hidden = !ui.score;
  if(ui.hand) setupHands(lv);
  if(ui.score) renderStaff($('#staffBox'), lv.notes[0], settings.staffNames, lv.notes, 0);
  updatePracticeUI();
  startMetronome();
  setAvatarState('idle', 'Preparando ' + lv.title + '… 🎶', 0);
  try{ loadHandGuideForLevel(lv); }catch(e){}

  // Mantener vista fija en la parte superior para ver partitura y teclas al mismo tiempo
  window.scrollTo({ top: 0, behavior: 'instant' });

  runIntro();
}

function skipIntro(){
  if(!practice.active || !practice.intro) return;
  playUiSound('click');
  hideMsgNow();
  demoRun++;
  practice.demo = false;
  endIntro();
  setAvatarState('idle', '¡A tocar en el piano! 🎹', 1500);
  toast('⏭ Intro saltada. ¡A tocar en el piano!');
}
if($('#skipIntroBtn')) $('#skipIntroBtn').addEventListener('click', skipIntro);

var _countdownTimer = null;
function startCountdown(onDone){
  var cd = document.getElementById('countdownOverlay');
  var num = document.getElementById('countdownNum');
  if(!cd || !num){ if(onDone) onDone(); return; }
  
  clearTimeout(_countdownTimer);
  cd.classList.add('show');
  
  var steps = ['3', '2', '1', '¡A TOCAR! 🎹'];
  var stepIdx = 0;
  
  function nextStep(){
    if(!practice.active){ cd.classList.remove('show'); return; }
    if(stepIdx < steps.length){
      num.textContent = steps[stepIdx];
      num.classList.remove('pop');
      void num.offsetWidth;
      num.classList.add('pop');
      
      try{
        if(stepIdx < 3) playUiSound('click');
        else playUiSound('victory');
      }catch(e){}
      
      stepIdx++;
      _countdownTimer = setTimeout(nextStep, stepIdx === steps.length ? 650 : 750);
    } else {
      cd.classList.remove('show');
      if(onDone) onDone();
    }
  }
  nextStep();
}

function endIntro(){
  practice.intro = false;
  if($('#skipIntroBtn')) $('#skipIntroBtn').hidden = true;
  $('#demoBtn').disabled = false;
  $('#demoBtn').textContent = '▶ Escuchar';
  // En modo niño, el consejo queda disponible bajo demanda una vez que empieza
  // a tocar. Así la pantalla muestra sólo la pista musical actual.
  if(document.body.classList.contains('kid-mode') && practice.level && practice.level.lesson){
    if($('#lessonBox')) $('#lessonBox').hidden = true;
    if($('#lessonToggle')) $('#lessonToggle').hidden = false;
  }
  if(practice.active) {
    startCountdown(function(){
      if(!practice.active) return;
      practice.lastTouchT = performance.now();
      setHint(practice.level.notes[practice.idx]);
      setAvatarState('idle', '¡Tu turno! Toca la primera nota 🎹', 2000);
    });
  }
}

function toggleLesson(){
  if(!practice.active || !practice.level || !practice.level.lesson) return;
  var box = $('#lessonBox'), btn = $('#lessonToggle');
  if(!box || !btn) return;
  var willShow = box.hidden;
  box.hidden = !willShow;
  btn.setAttribute('aria-expanded', willShow ? 'true' : 'false');
  btn.textContent = willShow ? '💡 Ocultar consejo' : '💡 Ver consejo';
}
if($('#lessonToggle')) $('#lessonToggle').addEventListener('click', toggleLesson);

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
  setAvatarState('listen', '🧘 Escuchando melodía…', 1500);
  showMsg('🧘 Antes de tocar:<br>' + rnd(PRE_TIPS), 1500, function(){
    if(!practice.active) return;
    var play = function(){
      $('#demoBtn').textContent = '🎧 Escuchando…';
      playDemo(function(){
        if(!practice.active) return;
        showMsg('🎹 ¡Ahora te toca a ti!', 1300, function(){ endIntro(); });
      });
    };
    if(needsListenMsg(practice.level)){
      showMsg('🎧 ¡Vamos a escuchar y practicar!', 1400, play);
    }else{
      play();
    }
  });
}

function exitPractice(){
  demoRun++;
  hideMsgNow();
  var cd = document.getElementById('countdownOverlay');
  if(cd) cd.classList.remove('show');
  clearTimeout(_countdownTimer);
  document.body.classList.remove('in-practice');
  practice.active = false; practice.demo = false; practice.intro = false;
  stopMetronome();
  if($('#skipIntroBtn')) $('#skipIntroBtn').hidden = true;
  if($('#lessonToggle')) $('#lessonToggle').hidden = true;
  $('#demoBtn').textContent = '▶ Escuchar';
  $('#demoBtn').disabled = false;
  hideArrow(); clearHints(); hideFingerChip();
  $('#practice').hidden = true; $('#pathView').hidden = false;
  setAvatarState('idle', '¡Explora el mapa y sigue avanzando! 🌟', 0);
  window.scrollTo({ top: 0, behavior: 'instant' });
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
  try{ animateNeonHint(note.midi); }catch(e){}
  if(ui.score) renderStaff($('#staffBox'), note, settings.staffNames, lv.notes, practice.idx);
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

function refreshTeach(){
  if(practice.active && practice.level.ui && practice.level.ui.score){
    var n = practice.level.notes[practice.idx];
    if(n) renderStaff($('#staffBox'), n, settings.staffNames, practice.level.notes, practice.idx);
  }
}

function updatePracticeUI(){
  var total = practice.level.notes.length;
  if($('#progFill')) $('#progFill').style.width = (practice.idx / total * 100) + '%';
  if($('#statProg')) $('#statProg').textContent = practice.idx + '/' + total;
  if($('#statStreak')) $('#statStreak').textContent = practice.streak + (practice.streak >= 5 ? ' 🔥' : '');
  var tries = practice.hits + practice.misses;
  if($('#statAcc')) $('#statAcc').textContent = tries ? Math.round(practice.hits / tries * 100) + '%' : '—';
}

function judge(m){
  if(!practice.active || practice.demo || practice.intro) return;
  var now = performance.now();
  var expectedNote = practice.level.notes[practice.idx];
  var expectedMidi = expectedNote.midi;

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
    // MODO PACIENTE (Pedagogía Infantil): Los errores no reinician la canción
    practice.misses++;
    practice.streak = 0;
    var el = keyEls[m];
    if(el){ el.classList.remove('err'); void el.offsetWidth; el.classList.add('err'); }
    var badge = $('#noteBadge');
    if(badge){ badge.classList.add('bad'); setTimeout(function(){ badge.classList.remove('bad'); }, 350); }
    
    setAvatarState('oops', '¡Casi! Intenta otra vez con calma 👍', 1200);
    var targetNote = practice.level.notes[practice.idx];
    if(targetNote) setHint(targetNote);
    updatePracticeUI();
  }
}

function finishPractice(){
  practice.active = false; hideArrow(); clearHints(); hideFingerChip();
  clearErrors();
  var tries = practice.hits + practice.misses;
  var acc = tries ? Math.round(practice.hits / tries * 100) : 100;
  var stars = acc >= 92 ? 3 : (acc >= 75 ? 2 : 1);

  // Manejo de nivel de Duelo Familiar
  if(practice.level.id === 9999 && typeof _duelState !== 'undefined' && _duelState.active){
    var points = Math.max(10, Math.round(acc * 10 - (practice.misses * 15)));
    if(_duelState.turn === 1) _duelState.score1 = points;
    else if(_duelState.turn === 2) _duelState.score2 = points;
    _duelState.turn++;
    _duelState.active = false;
    exitPractice();
    setTimeout(function(){
      if(typeof updateDuelUI === 'function') updateDuelUI();
      if($('#duelModal')) $('#duelModal').hidden = false;
      if(typeof playUiSound === 'function') playUiSound('victory');
    }, 600);
    return;
  }

  var prog = getPath();
  if(stars > (prog[practice.level.id] || 0)) prog[practice.level.id] = stars;
  storeSet('pf_path', JSON.stringify(prog));
  var nowEarned = earnedBadges(prog);
  var prev = [];
  try{ prev = JSON.parse(storeGet('pf_badges') || '[]'); }catch(e){}
  var newOnes = nowEarned.filter(function(id){ return prev.indexOf(id) < 0; });
  storeSet('pf_badges', JSON.stringify(nowEarned));
  
  // Actualizar misiones diarias
  try{
    if(typeof addMissionProgress === 'function'){
      addMissionProgress('songs', 1);
      addMissionProgress('stars', stars);
    }
  }catch(e){}

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
    if(!nxt) $('#modalTitle').textContent = '🏆 ¡Curso completado! ¡Pianista graduado! 🎓';
    else if(crossed) $('#modalTitle').textContent = '🎊 ¡' + STAGES[nxt.stage - 1].title + ' desbloqueada!';
    else $('#modalTitle').textContent = '🎉 ¡Nivel completado!';
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

/* ============ MODO DEMO / ESCUCHAR ============ */
function playDemo(onDone){
  if(!practice.level) return;
  var my = ++demoRun;
  practice.demo = true;
  $('#demoBtn').textContent = '⏹ Detener';
  clearHints(); hideArrow(); hideFingerChip();
  var tempoSel = $('#tempoSel');
  var mult = tempoSel ? (parseFloat(tempoSel.value) || 1) : 1;
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

/* ============ MAPA Y RUTA CONDENSADA ============ */
var selectedKidStage = null;
var expandedNormalStages = {};

function renderPath(){
  var box = $('#pathBox'); if(!box) return; box.innerHTML = '';
  var prog = getPath();
  var st = courseStats(prog);
  var cont = continueLevel(prog);
  var targetLvl = cont || LEVELS[0];
  var activeStageId = cont ? cont.stage : 1;

  // Actualizar Hero Card de Aventura V3
  var heroNextTxt = document.getElementById('heroNextLevelTxt');
  if(heroNextTxt){
    heroNextTxt.textContent = !cont ? '🎓 ¡Completaste los 44 niveles!' : ('Nivel ' + cont.id + ': ' + cont.title);
  }
  var heroBtn = document.getElementById('heroContinueBtn');
  if(heroBtn){
    heroBtn.onclick = function(){
      if(typeof playUiSound === 'function') playUiSound('click');
      startPractice(targetLvl);
    };
  }
  var heroStars = document.getElementById('heroStarsVal');
  if(heroStars) heroStars.textContent = st.stars;
  var heroStreak = document.getElementById('heroStreakVal');
  if(heroStreak){
    var dStats = (typeof loadDailyStats === 'function') ? loadDailyStats() : { streak: 0 };
    heroStreak.textContent = dStats.streak || 0;
  }

  if(cont){
    var bar = document.createElement('div');
    bar.className = 'continueBar';
    bar.innerHTML = '👉 <b>Continúa donde lo dejaste:</b>&nbsp; ' + cont.emoji + ' Nivel ' + cont.id + ' · ' + cont.title;
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
    
    if(typeof expandedNormalStages[sg.id] === 'undefined'){
      expandedNormalStages[sg.id] = (sg.id === activeStageId);
    }
    var isOpen = expandedNormalStages[sg.id];

    var mapContainer = document.createElement('div');
    mapContainer.className = 'mapStageContainer' + (isOpen ? ' open' : ' collapsed') + (sg.id === activeStageId ? ' active-stage' : '');

    var head = document.createElement('div');
    head.className = 'stageHead' + (sg.id === 1 ? ' s1' : '') + (isOpen ? ' open' : '');
    var stState;
    if(done) stState = '<span class="stageState ok">✅ Completada</span>';
    else if(locked) stState = '<span class="stageState">🔒 Bloqueada</span>';
    else stState = '<span class="stageState curr">🚀 En Progreso</span>';
    
    var toggleArrow = '<span class="stageToggleArrow">' + (isOpen ? '▲' : '▼') + '</span>';

    head.innerHTML = '<div class="stageEmoji">' + sg.emoji + '</div>' +
      '<div class="stageHeadContent"><div class="stageTitle">' + sg.title + '</div><div class="stageDesc">' + sg.desc + '</div></div>' +
      stState + toggleArrow;

    head.addEventListener('click', function(){
      playUiSound('click');
      expandedNormalStages[sg.id] = !expandedNormalStages[sg.id];
      renderPath();
    });

    mapContainer.appendChild(head);

    if(isOpen){
      var grid = document.createElement('div');
      grid.className = 'mapGrid';

      lvls.forEach(function(lv){
        var gi = LEVELS.indexOf(lv);
        var stars = prog[lv.id] || 0;
        var unlocked = (!locked) && (gi === 0 || (prog[LEVELS[gi - 1].id] || 0) > 0);
        var isNext = unlocked && stars === 0 && !foundNext;
        if(isNext) foundNext = true;
        var isSong = !!lv.song;

        var nodeItem = document.createElement('div');
        nodeItem.className = 'nodeItem' + (isSong ? ' is-song' : '');

        var nodeBtn = document.createElement('button');
        nodeBtn.className = 'nodeBtn' + (unlocked ? '' : ' locked') + (stars > 0 ? ' done' : '') + (isNext ? ' current' : '') + (isSong ? ' song-rainbow' : '');
        nodeBtn.type = 'button';
        nodeBtn.innerHTML = stars > 0 ? '✓' : (unlocked ? (isNext ? '▶' : lv.id) : '🔒');

        if(unlocked){
          nodeBtn.addEventListener('click', (function(l){ return function(){ playUiSound('click'); startPractice(l); }; })(lv));
        }

        var songTag = isSong ? '<span class="song-rainbow-tag">🎵 Canción</span>' : '';
        var title = document.createElement('div');
        title.className = 'nodeTitle';
        title.innerHTML = lv.emoji + ' ' + lv.title + (songTag ? '<br>' + songTag : '');

        var starsDiv = document.createElement('div');
        starsDiv.className = 'nodeStars';
        starsDiv.textContent = stars > 0 ? '★'.repeat(stars) + '☆'.repeat(3 - stars) : (isNext ? '¡Tocar!' : '');

        nodeItem.appendChild(nodeBtn);
        nodeItem.appendChild(title);
        nodeItem.appendChild(starsDiv);
        grid.appendChild(nodeItem);
      });

      mapContainer.appendChild(grid);
    }

    box.appendChild(mapContainer);
  });

  if($('#courseFill')) $('#courseFill').style.width = (st.done / LEVELS.length * 100) + '%';
  if($('#courseTxt')) $('#courseTxt').textContent = st.done + '/' + LEVELS.length + ' niveles';
  if($('#headerStars')) $('#headerStars').innerHTML = '⭐ ' + st.stars + ' Estrellas';
  renderBadges();
  try{ renderKidPathMini(); }catch(e){}
}

function renderKidPathMini(){
  var box = $('#kidPathMini'); if(!box) return;
  box.innerHTML = '';
  var prog = getPath();
  var cont = continueLevel(prog);
  var activeStageId = cont ? cont.stage : 1;

  if(selectedKidStage === null || selectedKidStage < 1 || selectedKidStage > STAGES.length){
    selectedKidStage = activeStageId;
  }

  // 1. Selector de Mundos / Etapas (Barra superior amigable para niños)
  var worldBar = document.createElement('div');
  worldBar.className = 'kid-world-selector';

  STAGES.forEach(function(sg){
    var isDone = stageDoneIn(prog, sg.id);
    var isLocked = stageLocked(sg.id, prog);
    var isSelected = (sg.id === selectedKidStage);
    var isCurrent = (sg.id === activeStageId);

    var wBtn = document.createElement('button');
    wBtn.type = 'button';
    wBtn.className = 'kid-world-btn' + (isSelected ? ' active' : '') + (isCurrent ? ' current-world' : '') + (isDone ? ' done' : '') + (isLocked ? ' locked' : '');
    wBtn.innerHTML = '<span class="kw-emoji">' + sg.emoji + '</span>' +
      '<span class="kw-label">Mundo ' + sg.id + (isDone ? ' ✓' : (isLocked ? ' 🔒' : '')) + '</span>';
    
    wBtn.addEventListener('click', function(){
      if(isLocked){
        if(typeof toast === 'function') toast('🔒 Completa la Etapa ' + (sg.id - 1) + ' para desbloquear este mundo.');
        return;
      }
      playUiSound('click');
      selectedKidStage = sg.id;
      renderKidPathMini();
    });
    worldBar.appendChild(wBtn);
  });
  box.appendChild(worldBar);

  // 2. Tarjeta del Mundo Seleccionado
  var currentSg = STAGES.filter(function(s){ return s.id === selectedKidStage; })[0] || STAGES[0];
  var stageLvls = LEVELS.filter(function(l){ return l.stage === currentSg.id; });
  var stageDone = stageDoneIn(prog, currentSg.id);
  var stageLockedFlag = stageLocked(currentSg.id, prog);

  var stageStars = 0;
  stageLvls.forEach(function(l){ stageStars += (prog[l.id] || 0); });

  var stageCard = document.createElement('div');
  stageCard.className = 'kid-stage-panel';

  var headerRow = document.createElement('div');
  headerRow.className = 'kid-stage-head';

  var prevBtn = document.createElement('button');
  prevBtn.type = 'button';
  prevBtn.className = 'kid-nav-arrow';
  prevBtn.innerHTML = '◀';
  prevBtn.title = 'Etapa anterior';
  prevBtn.disabled = (selectedKidStage <= 1);
  prevBtn.addEventListener('click', function(){
    if(selectedKidStage > 1){
      playUiSound('click');
      selectedKidStage--;
      renderKidPathMini();
    }
  });

  var titleCol = document.createElement('div');
  titleCol.className = 'kid-stage-info';
  titleCol.innerHTML = '<div class="kid-stage-title">' + currentSg.emoji + ' ' + currentSg.title + '</div>' +
    '<div class="kid-stage-desc">' + currentSg.desc + '</div>' +
    '<div class="kid-stage-progress">⭐ ' + stageStars + '/' + (stageLvls.length * 3) + ' estrellas' + (stageDone ? ' · ✅ ¡Mundo Completado!' : '') + '</div>';

  var nextBtn = document.createElement('button');
  nextBtn.type = 'button';
  nextBtn.className = 'kid-nav-arrow';
  nextBtn.innerHTML = '▶';
  nextBtn.title = 'Siguiente etapa';
  nextBtn.disabled = (selectedKidStage >= STAGES.length || stageLocked(selectedKidStage + 1, prog));
  nextBtn.addEventListener('click', function(){
    if(selectedKidStage < STAGES.length && !stageLocked(selectedKidStage + 1, prog)){
      playUiSound('click');
      selectedKidStage++;
      renderKidPathMini();
    }
  });

  headerRow.appendChild(prevBtn);
  headerRow.appendChild(titleCol);
  headerRow.appendChild(nextBtn);
  stageCard.appendChild(headerRow);

  // 3. Pastillas de Niveles (SOLO DE ESTA ETAPA: 2 a 6 elementos)
  var grid = document.createElement('div');
  grid.className = 'kid-pills-grid';

  var foundNext = false;
  stageLvls.forEach(function(lv){
    var gi = LEVELS.indexOf(lv);
    var stars = prog[lv.id] || 0;
    var unlocked = (!stageLockedFlag) && (gi === 0 || (prog[LEVELS[gi - 1].id] || 0) > 0);
    var isNext = unlocked && stars === 0 && !foundNext;
    if(isNext) foundNext = true;
    var isSong = !!lv.song;

    var pill = document.createElement('div');
    pill.className = 'kid-pill' + (unlocked ? '' : ' locked') + (isNext ? ' current' : '') + (stars > 0 ? ' done' : '') + (isSong ? ' is-song' : '');
    pill.setAttribute('data-level-id', String(lv.id));

    var songBadge = isSong ? '<span class="kid-song-badge">🎵 CANCIÓN</span>' : '';
    var starsHtml = stars > 0 ? '<span class="kid-pill-stars">' + '★'.repeat(stars) + '☆'.repeat(3 - stars) + '</span>' : (isNext ? '<span class="kid-pill-stars pulse-txt">¡A Tocar!</span>' : '');

    pill.innerHTML = '<span class="pill-emoji">' + lv.emoji + '</span>' +
      '<div class="pill-text-col">' +
        '<span class="pill-title">' + lv.title + '</span>' +
        songBadge +
      '</div>' +
      starsHtml;

    if(unlocked){
      pill.addEventListener('click', function(){ playUiSound('click'); startPractice(lv); });
    }
    grid.appendChild(pill);
  });
  stageCard.appendChild(grid);

  // 4. Botones de acción inferiores
  var actRow = document.createElement('div');
  actRow.className = 'kid-bottom-actions';
  if(cont){
    var heroPlay = document.createElement('button');
    heroPlay.type = 'button';
    heroPlay.className = 'kid-hero-play-btn';
    heroPlay.innerHTML = '▶ ¡Tocar ' + cont.title + '! ' + cont.emoji;
    heroPlay.addEventListener('click', function(){ playUiSound('click'); startPractice(cont); });
    actRow.appendChild(heroPlay);
  }

  var mapToggle = document.createElement('button');
  mapToggle.type = 'button';
  mapToggle.className = 'btn small ghost';
  mapToggle.textContent = '🗺️ Ver Mapa Completo';
  mapToggle.addEventListener('click', function(){
    playUiSound('click');
    document.body.classList.remove('kid-mode');
    storeSet('pf_kid_mode', '0');
    var kb = document.getElementById('kidModeBtn');
    if(kb) kb.textContent = '🧸 Modo Niño';
    $('#kidPathMini').hidden = true;
    $('#pathView').hidden = false;
    renderPath();
  });
  actRow.appendChild(mapToggle);
  stageCard.appendChild(actRow);

  box.appendChild(stageCard);

  if(document.body.classList.contains('kid-mode')){
    box.hidden = false;
    $('#pathView').hidden = true;
  } else {
    box.hidden = true;
  }
}

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
