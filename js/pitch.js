/* ==========================================================================
   PIANOFÁCIL PRO · MÓDULO 3: AFINADOR & DETECCIÓN DE TONO POR MICRÓFONO
   PianoFácil PRO · js/pitch.js
   ========================================================================== */

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
  scopeCtx.strokeStyle = isMic ? '#00e5ff' : '#ff9800';
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
  var maxLag = Math.min(N - 2, Math.floor(sr / 27)); // Rango extendido para piano
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

var micStarting = false;

function startMic(){
  if(micActive || micStarting) return;
  micStarting = true;
  if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){
    micStarting = false;
    var md = $('#micDot'); if(md) md.className = 'dot err';
    var ms = $('#micStatus'); if(ms) ms.textContent = 'Tu navegador no permite micrófono aquí.';
    return;
  }
  if(!ensureAudio()){
    micStarting = false;
    var ms2 = $('#micStatus'); if(ms2) ms2.textContent = 'Audio no disponible.';
    return;
  }
  var ms3 = $('#micStatus'); if(ms3) ms3.textContent = 'Pidiendo permiso…';
  
  navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } })
  .then(function(stream){
    micStarting = false;
    micStream = stream;
    micSrc = AC.createMediaStreamSource(stream);
    micFilterNode = AC.createBiquadFilter();
    micFilterNode.type = 'lowpass';
    micFilterNode.frequency.value = 1400;
    micSrc.connect(micFilterNode);

    analyser = AC.createAnalyser();
    analyser.fftSize = 4096;
    micBuf = new Float32Array(analyser.fftSize);
    micFilterNode.connect(analyser);

    try{ var mg = parseFloat(storeGet('pf_mic_gain') || '1'); if(mg && !isNaN(mg)) micGain = mg; }catch(e){}

    micActive = true; smoothMidi = null; pendingMidi = null; stable = 0; wasSilent = true;
    var mb = $('#micBtn'); if(mb) mb.textContent = '⏹ Detener Micrófono';
    var md = $('#micDot'); if(md) md.className = 'dot on';
    var mst = $('#micStatus'); if(mst) mst.textContent = 'Escuchando tu piano real… 🎧';
    micLoop();
  })
  .catch(function(){
    micStarting = false;
    micActive = false;
    var md = $('#micDot'); if(md) md.className = 'dot err';
    var ms = $('#micStatus'); if(ms) ms.textContent = 'No se pudo acceder al micrófono.';
  });
}

function stopMic(){
  micStarting = false;
  micActive = false;
  cancelAnimationFrame(rafId);
  if(micSrc){ try{ micSrc.disconnect(); }catch(e){} micSrc = null; }
  if(micFilterNode){ try{ micFilterNode.disconnect(); }catch(e){} micFilterNode = null; }
  if(analyser){ try{ analyser.disconnect(); }catch(e){} analyser = null; }
  if(micStream){
    try{ micStream.getTracks().forEach(function(t){ t.stop(); }); }catch(e){}
    micStream = null;
  }
  var mb = $('#micBtn'); if(mb) mb.textContent = '🎤 Activar micrófono';
  var md = $('#micDot'); if(md) md.className = 'dot';
  var mst = $('#micStatus'); if(mst) mst.textContent = 'Micrófono apagado';
  if($('#meterFill')) $('#meterFill').style.width = '0%';
}

function micLoop(){
  if(!micActive) return;
  rafId = requestAnimationFrame(micLoop);
  analyser.getFloatTimeDomainData(micBuf);
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

  // Semáforo de salud de micrófono en tiempo real
  var md = document.getElementById('micDot');
  if(md && micActive){
    if(res.freq > 0 && res.rms >= 0.01){
      md.className = 'dot on on-good';
    } else if(res.rms > 0.002 && res.rms < 0.01){
      md.className = 'dot on on-low';
    } else if(res.rms >= 0.035 && !res.freq){
      md.className = 'dot on on-noisy';
    } else {
      md.className = 'dot on';
    }
  }

  if(!res.freq){
    if(res.rms < gateVal()){ pendingMidi = null; stable = 0; wasSilent = true; smoothMidi = null; }
    return;
  }

  var detectedFreq = res.freq;
  var midi;

  // Detección guiada por nota esperada en modo lección (rechaza armónicos espurios sin aceptar octavas erróneas)
  var isPracticeActive = (typeof practice !== 'undefined' && practice && practice.active && practice.level && practice.level.notes && practice.level.notes[practice.idx]);
  if(isPracticeActive){
    var expectedMidi = practice.level.notes[practice.idx].midi;
    var targetFreq = 440 * Math.pow(2, (expectedMidi - 69) / 12);
    var cents = Math.abs(1200 * Math.log2(detectedFreq / targetFreq));

    // Exigir coincidencia exacta de nota y octava (±50 cents de la fundamental real)
    if(cents <= 50){
      midi = expectedMidi;
    } else {
      var rawM = 69 + 12 * Math.log2(detectedFreq / 440) + octShift() * 12;
      smoothMidi = (smoothMidi == null) ? rawM : smoothMidi + (rawM - smoothMidi) * 0.45;
      midi = Math.round(smoothMidi);
    }
  } else {
    var fm = 69 + 12 * Math.log2(detectedFreq / 440) + octShift() * 12;
    smoothMidi = (smoothMidi == null) ? fm : smoothMidi + (fm - smoothMidi) * 0.45;
    midi = Math.round(smoothMidi);
  }

  var pc = midiToPC(midi);
  var dn = document.getElementById('detNote');
  var dh = document.getElementById('detHz');
  if(dn) dn.textContent = settings.sys === 'solfege' ? SOL[pc] : pc;
  if(dh) dh.textContent = pc + midiToOct(midi) + ' · ' + Math.round(res.freq) + ' Hz';

  if(midi === pendingMidi) stable++; else { pendingMidi = midi; stable = 1; }
  
  // En lección bastan 3 cuadros estables (~45ms) para respuesta ultra ágil
  var requiredFrames = isPracticeActive ? 3 : 5;
  if(stable === requiredFrames){
    var now = performance.now();
    var ok = (wasSilent || midi !== lastEmitMidi || now - lastEmitT > 600) && (now - lastEmitT > 180 || midi !== lastEmitMidi);
    if(ok){
      wasSilent = false; lastEmitMidi = midi; lastEmitT = now;
      if(typeof triggerNote === 'function') triggerNote(midi, true);
    }
  }
}
