window.addEventListener('error',function(e){
  var b=document.getElementById('errBanner');
  if(b){b.style.display='block';b.textContent='⚠ Error: '+(e.message||e);}
});

/* ============ ALMACENAMIENTO LOCAL ============ */
function storeGet(k){ try{return localStorage.getItem(k);}catch(e){return null;} }
function storeSet(k,v){ try{localStorage.setItem(k,v);}catch(e){} }

/* ============ HELPER DOM ============ */
function $(sel){ return document.querySelector(sel); }

/* ============ FRASES Y MENSAJES DE INTERFAZ ============ */
function renderBadges(){
  var prog=getPath();
  var earned=earnedBadges(prog);
  var bar=$('#badgesBar');if(!bar)return;
  bar.innerHTML='';
  BADGES.forEach(function(b){
    var on=earned.indexOf(b.id)>=0;
    var chip=document.createElement('div');
    chip.className='badgeChip'+(on?' on':'');
    chip.title=b.name+' — '+b.desc;
    chip.innerHTML='<span class="bi">'+(on?b.icon:'🔒')+'</span>'+b.name;
    bar.appendChild(chip);
  });
}

function toast(txt){
  var t=$('#toast');if(!t)return;
  t.textContent=txt;t.classList.add('show');
  clearTimeout(t._h);t._h=setTimeout(function(){t.classList.remove('show');},2600);
}
var msgTimer=null;
function showMsg(text,ms,onDone){
  var el=$('#bigMsg');if(!el)return;
  el.innerHTML=text;
  el.classList.add('show');
  clearTimeout(msgTimer);
  msgTimer=setTimeout(function(){
    el.classList.remove('show');
    if(onDone) setTimeout(onDone,380);
  },ms);
}
function hideMsgNow(){
  clearTimeout(msgTimer);
  var el=$('#bigMsg');if(el)el.classList.remove('show');
}

/* ============ AJUSTES DE CONFIGURACIÓN ============ */
var settings={vol:.8,sys:'solfege',names:true,hints:true,staffNames:true,waitMode:false,synthesia:false};
try{ var sv=JSON.parse(storeGet('pf_settings')||'{}'); for(var sk in sv) settings[sk]=sv[sk]; }catch(e){}
function saveSettings(){storeSet('pf_settings',JSON.stringify(settings));}

/* ============ MOTOR AUDIO WEB CON CLEANUP DE AUDIONODES ============ */
var AC=null,master=null;
function ensureAudio(){
  if(!AC){
    var Ctx=window.AudioContext||window.webkitAudioContext;
    if(!Ctx) return false;
    AC=new Ctx();
    master=AC.createGain(); master.gain.value=settings.vol;
    var comp=AC.createDynamicsCompressor();
    master.connect(comp); comp.connect(AC.destination);
  }
  if(AC.state==='suspended') AC.resume();
  return true;
}

function playSound(m,vel){
  if(!AC) return;
  var f=440*Math.pow(2,(m-69)/12), t=AC.currentTime;
  var dec=Math.max(1.1,2.6-(m-60)*0.045);
  var env=AC.createGain();
  env.gain.setValueAtTime(0,t);
  env.gain.linearRampToValueAtTime(.4*vel,t+.006);
  env.gain.exponentialRampToValueAtTime(.0001,t+dec);
  
  var lp=AC.createBiquadFilter(); lp.type='lowpass';
  lp.frequency.setValueAtTime(Math.min(f*10,12000),t);
  lp.frequency.exponentialRampToValueAtTime(Math.max(f*1.3,300),t+dec*.7);
  
  env.connect(lp); lp.connect(master);
  
  var H=[1,2,3,4,5],G=[1,.45,.22,.12,.06];
  var activeOscillators=[];

  H.forEach(function(h,i){
    var o=AC.createOscillator(); o.type='sine'; o.frequency.value=f*h; o.detune.value=(Math.random()-.5)*4;
    var og=AC.createGain(); og.gain.value=G[i]/(1+h*.12);
    o.connect(og); og.connect(env); o.start(t); o.stop(t+dec+.2);
    activeOscillators.push({osc:o, gain:og});
  });

  // Limpieza de nodos (AudioNode Cleanup) al finalizar el sonido
  setTimeout(function(){
    activeOscillators.forEach(function(item){
      try{ item.osc.disconnect(); item.gain.disconnect(); }catch(e){}
    });
    try{ env.disconnect(); lp.disconnect(); }catch(e){}
  }, (dec + 0.3) * 1000);
}

/* ============ PIANO VIRTUAL ============ */
var piano=$('#piano'), keyEls={};
var whiteIdx={}, whiteCount=0;
var BLACK=[1,3,6,8,10];
for(var m0=FIRST;m0<=LAST;m0++){ if(BLACK.indexOf(m0%12)<0){whiteIdx[m0]=whiteCount;whiteCount++;} }
for(var m1=FIRST;m1<=LAST;m1++){
  (function(m){
    var black=BLACK.indexOf(m%12)>=0;
    var el=document.createElement('div');
    el.className='key '+(black?'black':'white');
    if(!black){var nm=document.createElement('span');nm.className='kname';el.appendChild(nm);}
    var kh=document.createElement('span');kh.className='khint';kh.textContent=(MIDITOKEY[m]||'').toUpperCase();el.appendChild(kh);
    if(piano) piano.appendChild(el);
    if(black){
      el.style.left=((whiteIdx[m-1]+1)*100/whiteCount)+'%';
      var wPct=(100/whiteCount*0.62);
      el.style.width=wPct+'%';
      el.style.marginLeft=(-wPct/2)+'%';
    }
    keyEls[m]=el;
    if(window.PointerEvent){
      el.addEventListener('pointerdown',function(ev){
        if(ev.cancelable)ev.preventDefault();
        try{el.releasePointerCapture(ev.pointerId);}catch(e){}
        el._downPid=ev.pointerId;
        triggerNote(m,false);
      });
      el.addEventListener('pointerenter',function(ev){
        if(ev.buttons&&(ev.buttons&1)&&ev.pointerId!==el._downPid) triggerNote(m,false);
      });
      el.addEventListener('pointerup',function(ev){ if(ev.pointerId===el._downPid) el._downPid=-1; });
    }else{
      el.addEventListener('mousedown',function(ev){ if(ev.cancelable)ev.preventDefault(); triggerNote(m,false); });
      el.addEventListener('touchstart',function(ev){ev.preventDefault();triggerNote(m,false);},{passive:false});
    }
    el.addEventListener('contextmenu',function(ev){ev.preventDefault();});
  })(m1);
}

function refreshLabels(){
  for(var m=FIRST;m<=LAST;m++){
    var el=keyEls[m]; if(!el)continue;
    var nm=el.querySelector('.kname');
    if(nm){var pc=midiToPC(m);nm.textContent=settings.sys==='solfege'?SOL[pc]:pc;nm.style.display=settings.names?'':'none';}
    var kh=el.querySelector('.khint'); if(kh)kh.style.display=settings.hints?'':'none';
  }
}

/* ============ DISPARO DE NOTAS Y DEBOUNCE ============ */
var _lastNoteMidi = null, _lastNoteTime = 0;
function triggerNote(m,silent,internal){
  var now = performance.now();
  if(!internal && m === _lastNoteMidi && (now - _lastNoteTime) < 120) return;
  _lastNoteMidi = m; _lastNoteTime = now;
  if(practice.intro && !internal) return;
  if(!silent){ ensureAudio(); playSound(m,1); }
  flash(m);
  recordEvent(m);
  judge(m);
}
function flash(m){
  var el=keyEls[m]; if(!el)return;
  el.classList.remove('down'); void el.offsetWidth; el.classList.add('down');
  clearTimeout(el._t); el._t=setTimeout(function(){el.classList.remove('down');},230);
  burst(m,false);
}
function burst(m,big){
  var el=keyEls[m]; if(!el)return;
  var pianoWrap=$('#pianoWrap');if(!pianoWrap)return;
  var r=el.getBoundingClientRect(),w=pianoWrap.getBoundingClientRect();
  var x=r.left+r.width/2-w.left,y=r.top-w.top+6,fx=$('#fx');if(!fx)return;

  // EFECTO DE ONDA DIVERGENTE (RIPPLE)
  var rip=document.createElement('i'); rip.className='keyRipple';
  rip.style.left=x+'px'; rip.style.top=y+'px';
  fx.appendChild(rip);
  rip.addEventListener('animationend',function(){this.remove();});

  // EFECTO DE CHISPAS Y NOTAS ARCADE
  var symbols=['🎵','🎶','✨','⭐','🎹','💫'];
  var colors=['#ffb547','#8b6cff','#3ddc84','#ff6b9d','#4dd0ff'];
  var n=big?12:5;
  for(var i=0;i<n;i++){
    var p=document.createElement('i'); p.className='pt';
    p.style.left=x+'px'; p.style.top=y+'px';
    if(Math.random()<0.45){
      p.textContent=symbols[Math.floor(Math.random()*symbols.length)];
    }else{
      p.style.background=colors[Math.floor(Math.random()*colors.length)];
      p.style.width='8px'; p.style.height='8px'; p.style.borderRadius='50%';
    }
    p.style.setProperty('--dx',(Math.random()*80-40)+'px');
    p.style.setProperty('--dy',(-30-Math.random()*75)+'px');
    fx.appendChild(p);
    p.addEventListener('animationend',function(){this.remove();});
  }
}

/* ============ PROCESAMIENTO Y FILTRADO DE MICRÓFONO ============ */
var micStream=null,micSrc=null,micFilterNode=null,analyser=null,micBuf=null,rafId=null,micActive=false;
var smoothMidi=null,pendingMidi=null,stable=0,wasSilent=true,lastEmitT=0,lastEmitMidi=null;
function gateVal(){
  var el=document.getElementById('sens');
  return 0.0005*Math.pow(10,((el?parseFloat(el.value):50)/50));
}
function octShift(){
  var el=document.getElementById('octSel');
  return el?parseInt(el.value,10)||0:0;
}
function detectPitch(buf,sr,gate){
  var N=buf.length,rms=0,i;
  for(i=0;i<N;i++){var v=buf[i];rms+=v*v;}
  rms=Math.sqrt(rms/N);
  if(rms<gate) return {rms:rms,freq:0};
  var minLag=Math.max(2,Math.floor(sr/1100));
  var maxLag=Math.min(N-2,Math.floor(sr/65));
  var energy=0; for(i=0;i<N;i+=2) energy+=buf[i]*buf[i];
  var bestLag=-1,best=0,lag;
  for(lag=minLag;lag<=maxLag;lag++){
    var s=0;
    for(i=0;i<N-lag;i+=2) s+=buf[i]*buf[i+lag];
    if(s>best){best=s;bestLag=lag;}
  }
  if(bestLag<0||best<energy*0.3) return {rms:rms,freq:0};
  function corr(l){var t=0;for(var j=0;j<N-l;j+=2)t+=buf[j]*buf[j+l];return t;}
  var prev=corr(bestLag-1),next=corr(bestLag+1);
  var a=(prev+next-2*best)/2,b=(next-prev)/2;
  var refined=bestLag; if(a) refined=bestLag-b/(2*a);
  var freq=sr/Math.max(1,refined);
  if(freq<60||freq>1200) return {rms:rms,freq:0};
  return {rms:rms,freq:freq};
}
function startMic(){
  if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){
    $('#micDot').className='dot err';
    $('#micStatus').textContent='Tu navegador no permite micrófono aquí.';
    return;
  }
  if(!ensureAudio()){ $('#micStatus').textContent='Audio no disponible.'; return; }
  $('#micStatus').textContent='Pidiendo permiso…';
  navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false}})
  .then(function(stream){
    micStream=stream;
    micSrc=AC.createMediaStreamSource(stream);
    micFilterNode=AC.createBiquadFilter();
    micFilterNode.type='lowpass';
    micFilterNode.frequency.value=1400;
    micSrc.connect(micFilterNode);

    analyser=AC.createAnalyser(); analyser.fftSize=2048;
    micBuf=new Float32Array(analyser.fftSize);
    micFilterNode.connect(analyser);

    micActive=true; smoothMidi=null;pendingMidi=null;stable=0;wasSilent=true;
    $('#micBtn').textContent='⏹ Detener';
    $('#micDot').className='dot on';
    $('#micStatus').textContent='Escuchando el piano de Mateo… 🎧';
    micLoop();
  })
  .catch(function(){
    $('#micDot').className='dot err';
    $('#micStatus').textContent='No se pudo acceder al micrófono.';
  });
}
function stopMic(){
  micActive=false;
  cancelAnimationFrame(rafId);
  if(micStream){micStream.getTracks().forEach(function(t){t.stop();});}
  micStream=null;
  $('#micBtn').textContent='🎤 Activar micrófono';
  $('#micDot').className='dot';
  $('#micStatus').textContent='Micrófono apagado';
  if($('#meterFill')) $('#meterFill').style.width='0%';
}
function micLoop(){
  if(!micActive)return;
  rafId=requestAnimationFrame(micLoop);
  analyser.getFloatTimeDomainData(micBuf);
  micFrame(detectPitch(micBuf,AC.sampleRate,gateVal()));
}
function micFrame(res){
  var mf=document.getElementById('meterFill');
  if(mf) mf.style.width=Math.min(100,res.rms*600)+'%';
  if(!res.freq){
    if(res.rms<gateVal()){pendingMidi=null;stable=0;wasSilent=true;smoothMidi=null;}
    return;
  }
  var fm=69+12*Math.log2(res.freq/440)+octShift()*12;
  smoothMidi=(smoothMidi==null)?fm:smoothMidi+(fm-smoothMidi)*.45;
  var midi=Math.round(smoothMidi);
  var pc=midiToPC(midi);
  var dn=document.getElementById('detNote');
  var dh=document.getElementById('detHz');
  if(dn) dn.textContent=settings.sys==='solfege'?SOL[pc]:pc;
  if(dh) dh.textContent=pc+midiToOct(midi)+' · '+Math.round(res.freq)+' Hz';
  if(midi===pendingMidi)stable++; else{pendingMidi=midi;stable=1;}
  if(stable===6){
    var now=performance.now();
    var ok=(wasSilent||midi!==lastEmitMidi||now-lastEmitT>800)&&(now-lastEmitT>220||midi!==lastEmitMidi);
    if(ok){
      wasSilent=false;lastEmitMidi=midi;lastEmitT=now;
      triggerNote(midi,true);
    }
  }
}
if($('#micBtn')) $('#micBtn').addEventListener('click',function(){ micActive?stopMic():startMic(); });
if($('#srcMic')) $('#srcMic').addEventListener('click',function(){
  $('#micPanel').hidden=false;
  $('#srcMic').classList.add('active');
  $('#srcPiano').classList.remove('active');
});
if($('#srcPiano')) $('#srcPiano').addEventListener('click',function(){
  $('#micPanel').hidden=true;
  $('#srcPiano').classList.add('active');
  $('#srcMic').classList.remove('active');
  stopMic();
});

/* ============ TECLADO FÍSICO ============ */
window.addEventListener('keydown',function(e){
  if(e.repeat)return;
  if(e.key==='Escape'){
    if($('#modal') && !$('#modal').hidden){closeToPath();}
    else if(practice.active){exitPractice();}
    return;
  }
  var k=e.key.toLowerCase();
  if(k in KEYMAP) triggerNote(KEYMAP[k],false);
});
window.addEventListener('blur',function(){
  for(var k in keyEls) keyEls[k].classList.remove('down');
});

/* ============ PESTAÑAS ============ */
function setMode(mode){
  $('#tabLearn').classList.toggle('active',mode==='learn');
  $('#tabFree').classList.toggle('active',mode==='free');
  $('#learnPanel').hidden=(mode!=='learn');
  $('#freePanel').hidden=(mode!=='free');
  if(mode==='free') exitPractice();
}
if($('#tabLearn')) $('#tabLearn').addEventListener('click',function(){ if(practice.active)exitPractice(); setMode('learn'); });
if($('#tabFree')) $('#tabFree').addEventListener('click',function(){ setMode('free'); });

/* ============ PARTITURA SVG ============ */
function diatonic(m){
  var pc=((m%12)+12)%12, oct=Math.floor(m/12)-1;
  var letter=[0,-1,1,-1,2,3,-1,4,-1,5,-1,6][pc];
  return oct*7+letter;
}
function renderStaff(container,note,showName){
  if(!container||!note)return;
  var steps=diatonic(note.midi)-30;
  var y=70-steps*5, x=150, dur=note.dur;
  var hollow=(dur>=2), hasStem=(dur<4), isEighth=(dur<1);
  var sharp=midiToPC(note.midi).indexOf('#')>=0;
  var s='<svg viewBox="0 0 260 118" width="250" height="114">';
  s+='<defs><linearGradient id="cGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#ffb547"/><stop offset="100%" stop-color="#8b6cff"/></linearGradient></defs>';
  for(var i=0;i<5;i++) s+='<line x1="12" y1="'+(30+i*10)+'" x2="248" y2="'+(30+i*10)+'" stroke="#6a7089" stroke-width="1.4"/>';
  s+='<text x="14" y="80" font-size="60" fill="#cdd2e4" font-family="serif">𝄞</text>';

  // CURSOR RESPLANDECIENTE DE LA NOTA ACTUAL (PENTAGRAMA VIVO)
  s+='<line class="staffCursor" x1="'+x+'" y1="18" x2="'+x+'" y2="92" stroke="url(#cGrad)" stroke-dasharray="4 2"/>';

  if(note.midi<=60) s+='<line x1="'+(x-13)+'" y1="80" x2="'+(x+13)+'" y2="80" stroke="#6a7089" stroke-width="1.4"/>';
  if(sharp) s+='<text x="'+(x-19)+'" y="'+(y+6)+'" font-size="17" fill="#ffb547" font-family="serif">♯</text>';
  if(hasStem) s+='<line x1="'+(x+7)+'" y1="'+(y-2)+'" x2="'+(x+7)+'" y2="'+(y-40)+'" stroke="#ffb547" stroke-width="2.2"/>';
  if(isEighth) s+='<path d="M '+(x+7)+' '+(y-40)+' q 12 6 7 22" stroke="#ffb547" stroke-width="2.6" fill="none"/>';
  s+='<ellipse cx="'+x+'" cy="'+y+'" rx="8" ry="6" transform="rotate(-18 '+x+' '+y+')" '+(hollow?'fill="none" stroke="#ffb547" stroke-width="2.5"':'fill="#ffb547"')+' style="filter:drop-shadow(0 0 6px rgba(255,181,71,0.8))"/>';
  if(showName){
    var pc2=midiToPC(note.midi);
    var label=settings.sys==='solfege'?SOL[pc2]:pc2;
    s+='<text x="'+x+'" y="112" text-anchor="middle" fill="#ffb547" font-size="14" font-family="Outfit,sans-serif" font-weight="800">'+label+midiToOct(note.midi)+'</text>';
  }
  s+='</svg>';
  container.innerHTML=s;
}

/* ============ MANOS INTERACTIVAS SVG ============ */
function handSVG(prefix,mirror){
  var F=[{x:6,w:19,y:52,h:46},{x:30,w:17,y:24,h:70},{x:52,w:17,y:14,h:80},{x:74,w:17,y:22,h:72},{x:96,w:16,y:38,h:56}];
  var s='<svg viewBox="0 0 140 132" width="112" class="'+(mirror?'lhsvg':'')+'">';
  s+='<rect x="26" y="88" width="92" height="34" rx="14" fill="#343a4f"/>';
  var i,f,x;
  for(i=0;i<5;i++){
    f=F[i];
    x=mirror?(140-f.x-f.w):f.x;
    s+='<rect class="hg" id="'+prefix+'g'+(i+1)+'" x="'+x+'" y="'+f.y+'" width="'+f.w+'" height="'+f.h+'" rx="8"/>';
  }
  for(i=0;i<5;i++){
    f=F[i];
    var cx=mirror?(140-f.x-f.w/2):(f.x+f.w/2);
    s+='<text class="hnum" id="'+prefix+'n'+(i+1)+'" x="'+cx+'" y="115">'+(i+1)+'</text>';
  }
  s+='</svg>';
  return s;
}
function handWrap(prefix,label,mirror){
  var d=document.createElement('div');
  d.className='handUnit';
  d.id=(prefix==='hgL')?'huL':'huR';
  d.innerHTML='<div class="handLbl">'+label+'</div>'+handSVG(prefix,mirror);
  return d;
}
var handState={both:false,leftOnly:false};
function setupHands(lv){
  var box=$('#handsBox');if(!box)return;box.innerHTML='';
  var both=!!lv.hands, leftOnly=(!both)&&lv.handAll==='I';
  if(both){
    box.appendChild(handWrap('hgL','🫲 Izquierda',true));
    box.appendChild(handWrap('hgR','🖐 Derecha',false));
  }else if(leftOnly){
    box.appendChild(handWrap('hgL','🫲 Izquierda',true));
  }else{
    box.appendChild(handWrap('hgR','🖐 Derecha',false));
  }
  handState={both:both,leftOnly:leftOnly};
}
function clearHandHighlights(){
  ['hgL','hgR'].forEach(function(p){
    for(var i=1;i<=5;i++){
      var g=document.getElementById(p+'g'+i), t=document.getElementById(p+'n'+i);
      if(g)g.classList.remove('on');
      if(t)t.classList.remove('on');
    }
  });
  var huL=document.getElementById('huL'),huR=document.getElementById('huR');
  if(huL)huL.classList.remove('act');
  if(huR)huR.classList.remove('act');
}
function setHandFinger(n,which){
  clearHandHighlights();
  var pref;
  if(handState.both) pref=(which==='I')?'hgL':'hgR';
  else pref=handState.leftOnly?'hgL':'hgR';
  if(n){
    var g=document.getElementById(pref+'g'+n), t=document.getElementById(pref+'n'+n);
    if(g)g.classList.add('on');
    if(t)t.classList.add('on');
  }else if(handState.both&&which){
    var hu=(which==='I')?document.getElementById('huL'):document.getElementById('huR');
    if(hu)hu.classList.add('act');
  }
  var ht=$('#handTxt');
  if(ht) ht.textContent=n?('Dedo '+n+' · '+FING_NAMES[n]+(handState.both?(which==='I'?' · Izquierda':' · Derecha'):'')):'Observa las manos';
  var hc=$('#handCard');
  if(hc) hc.classList.toggle('lh',which==='I'&&!handState.both);
}
function positionFingerChip(el,f){
  var pianoWrap=$('#pianoWrap');if(!pianoWrap)return;
  var r=el.getBoundingClientRect(),w=pianoWrap.getBoundingClientRect();
  var chip=$('#fingerChip');if(!chip)return;
  chip.textContent=f;
  chip.style.left=(r.left+r.width/2-w.left)+'px';
  chip.style.top=(r.top-w.top+18)+'px';
  chip.style.opacity='1';
}
function hideFingerChip(){var c=$('#fingerChip');if(c)c.style.opacity='0';}

/* ============ RUTA PEDAGÓGICA Y AVANCE ============ */
function getPath(){ try{return JSON.parse(storeGet('pf_path')||'{}');}catch(e){return {};} }
function stageLocked(s,prog){
  if(s===1) return false;
  return !stageDoneIn(prog,s-1);
}
function nextLevelFor(prog){
  for(var i=0;i<LEVELS.length;i++){
    var lv=LEVELS[i];
    if((prog[lv.id]||0)>0) continue;
    if(stageLocked(lv.stage,prog)) continue;
    return lv;
  }
  return null;
}
function continueLevel(prog){
  var lastId=parseInt(storeGet('pf_last')||'0',10);
  var last=null;
  if(lastId) last=LEVELS.filter(function(l){return l.id===lastId;})[0]||null;
  if(last&&(prog[last.id]||0)===0&&!stageLocked(last.stage,prog)) return last;
  return nextLevelFor(prog);
}
function renderPath(){
  var box=$('#pathBox'); if(!box)return; box.innerHTML='';
  var prog=getPath();
  var st=courseStats(prog);
  var cont=continueLevel(prog);
  if(cont){
    var bar=document.createElement('div');
    bar.className='continueBar';
    bar.innerHTML='👉 <b>Continúa donde lo dejaste, Mateo:</b>&nbsp; '+cont.emoji+' Nivel '+cont.id+' · '+cont.title;
    var cb=document.createElement('button');cb.className='btn small';cb.type='button';cb.textContent='▶ Continuar';
    cb.addEventListener('click',(function(l){return function(){startPractice(l);};})(cont));
    bar.appendChild(cb);
    box.appendChild(bar);
  }
  var foundNext=false;
  STAGES.forEach(function(sg){
    var lvls=LEVELS.filter(function(l){return l.stage===sg.id;});
    var done=stageDoneIn(prog,sg.id);
    var locked=stageLocked(sg.id,prog);
    var head=document.createElement('div');
    head.className='stageHead'+(sg.id===1?' s1':'');
    var stState;
    if(done) stState='<span class="stageState ok">✅ Completada</span>';
    else if(locked) stState='<span class="stageState">🔒 Completa Etapa '+(sg.id-1)+'</span>';
    else stState='<span class="stageState">En progreso…</span>';
    head.innerHTML='<div class="stageEmoji">'+sg.emoji+'</div>'+
      '<div><div class="stageTitle">'+sg.title+'</div><div class="stageDesc">'+sg.desc+'</div></div>'+stState;
    box.appendChild(head);

    // MAPA EN CUADRÍCULA/NODOS ESTILO MARIO WORLD & DUOLINGO
    var mapContainer=document.createElement('div');
    mapContainer.className='mapStageContainer';
    var grid=document.createElement('div');
    grid.className='mapGrid';

    lvls.forEach(function(lv){
      var gi=LEVELS.indexOf(lv);
      var stars=prog[lv.id]||0;
      var unlocked=(!locked)&&(gi===0||(prog[LEVELS[gi-1].id]||0)>0);
      var isNext=unlocked&&stars===0&&!foundNext;
      if(isNext) foundNext=true;

      var nodeItem=document.createElement('div');
      nodeItem.className='nodeItem';

      var nodeBtn=document.createElement('button');
      nodeBtn.className='nodeBtn'+(unlocked?'':' locked')+(stars>0?' done':'')+(isNext?' current':'');
      nodeBtn.type='button';
      nodeBtn.innerHTML=stars>0?'✓':(unlocked?(isNext?'▶':lv.id):'🔒');

      if(unlocked){
        nodeBtn.addEventListener('click',(function(l){return function(){startPractice(l);};})(lv));
      }

      var title=document.createElement('div');
      title.className='nodeTitle';
      title.textContent=lv.emoji+' '+lv.title;

      var starsDiv=document.createElement('div');
      starsDiv.className='nodeStars';
      starsDiv.textContent=stars>0?'★'.repeat(stars)+'☆'.repeat(3-stars):(isNext?'¡Tocar!':'');

      nodeItem.appendChild(nodeBtn);
      nodeItem.appendChild(title);
      nodeItem.appendChild(starsDiv);
      grid.appendChild(nodeItem);
    });

    mapContainer.appendChild(grid);
    box.appendChild(mapContainer);
  });
  if($('#courseFill')) $('#courseFill').style.width=(st.done/LEVELS.length*100)+'%';
  if($('#courseTxt')) $('#courseTxt').textContent=st.done+'/'+LEVELS.length+' · ⭐ '+st.stars;
  renderBadges();
}

/* ============ PRÁCTICA Y MODO APRENDIZAJE ============ */
var practice={active:false,level:null,idx:0,hits:0,misses:0,streak:0,bestStreak:0,demo:false,intro:false,lastTouchT:0};
var lastHintMidi=null,demoRun=0;
function needsListenMsg(lv){ return (lv.stage===1&&lv.id<=2)||!!lv.song; }

function startPractice(lv){
  setMode('learn');
  demoRun++;
  stopRecorderPlayback();
  hideMsgNow();
  practice={active:true,level:lv,idx:0,hits:0,misses:0,streak:0,bestStreak:0,demo:false,intro:true,lastTouchT:performance.now()};
  storeSet('pf_last',String(lv.id));
  $('#pathView').hidden=true; $('#practice').hidden=false;
  $('#pracName').textContent=lv.emoji+' '+lv.title;
  $('#pracLvl').textContent='Nivel '+lv.id+' de '+LEVELS.length+' · '+STAGES[lv.stage-1].title;
  $('#demoBtn').textContent='▶ Escuchar';
  if($('#skipIntroBtn')) $('#skipIntroBtn').hidden=false; // Mostrar botón de saltar intro
  
  if(lv.lesson){$('#lessonBox').hidden=false;$('#lessonBox').innerHTML='💡 '+lv.lesson;}
  else $('#lessonBox').hidden=true;
  var ui=lv.ui||{};
  $('#teachRow').hidden=!(ui.hand||ui.score);
  $('#handCard').hidden=!ui.hand;
  $('#staffCard').hidden=!ui.score;
  if(ui.hand) setupHands(lv);
  if(ui.score) renderStaff($('#staffBox'),lv.notes[0],settings.staffNames);
  updatePracticeUI();
  startMetronome();
  runIntro();
}

/* Botón "⏭ Saltar Intro" */
function skipIntro(){
  if(!practice.active || !practice.intro) return;
  hideMsgNow();
  demoRun++;
  practice.demo=false;
  endIntro();
  toast('⏭ Intro saltada. ¡A tocar, Mateo!');
}
if($('#skipIntroBtn')) $('#skipIntroBtn').addEventListener('click', skipIntro);

function endIntro(){
  practice.intro=false;
  if($('#skipIntroBtn')) $('#skipIntroBtn').hidden=true;
  $('#demoBtn').disabled=false;
  $('#demoBtn').textContent='▶ Escuchar';
  if(practice.active) {
    practice.lastTouchT = performance.now();
    setHint(practice.level.notes[practice.idx]);
  }
}
var metroInterval=null, beatCount=0;
function startMetronome(){
  stopMetronome();
  var ms=60000/practice.level.bpm;
  beatCount=0;
  metroInterval=setInterval(function(){
    var m=$('#metronome');if(!m)return;
    m.classList.remove('beat','beat1');
    void m.offsetWidth;
    m.classList.add(beatCount===0?'beat1':'beat');
    beatCount=(beatCount+1)%4;
  },ms);
}
function stopMetronome(){ clearInterval(metroInterval); }

function runIntro(){
  practice.intro=true;
  $('#demoBtn').disabled=true;
  $('#demoBtn').textContent='🎧 Preparando…';
  showMsg('🧘 Antes de tocar, Mateo:<br>'+rnd(PRE_TIPS),3800,function(){
    if(!practice.active)return;
    var play=function(){
      $('#demoBtn').textContent='🎧 Escuchando…';
      playDemo(function(){
        if(!practice.active)return;
        showMsg('🎹 ¡Ahora te toca a ti, Mateo!',3000,function(){ endIntro(); });
      });
    };
    if(needsListenMsg(practice.level)){
      showMsg('🎧 ¡Vamos a escuchar y luego a practicar, Mateo!',3500,play);
    }else{
      play();
    }
  });
}
function exitPractice(){
  demoRun++;
  hideMsgNow();
  practice.active=false;practice.demo=false;practice.intro=false;
  stopMetronome();
  if($('#skipIntroBtn')) $('#skipIntroBtn').hidden=true;
  $('#demoBtn').textContent='▶ Escuchar';
  $('#demoBtn').disabled=false;
  hideArrow();clearHints();hideFingerChip();
  $('#practice').hidden=true;$('#pathView').hidden=false;
  renderPath();
}
if($('#backBtn')) $('#backBtn').addEventListener('click',exitPractice);

function currentHand(){
  var lv=practice.level;
  if(lv.hands) return lv.hands[practice.idx];
  return lv.handAll||null;
}

function setHint(note){
  clearHints(); lastHintMidi=note.midi;
  var lv=practice.level, ui=lv.ui||{};
  var el=keyEls[note.midi]; if(el) el.classList.add('hint');
  var pc=midiToPC(note.midi),nameEl=$('#noteName');
  if(nameEl){
    nameEl.textContent=settings.sys==='solfege'?SOL[pc]:pc;
    nameEl.classList.remove('pop');void nameEl.offsetWidth;nameEl.classList.add('pop');
  }
  if(el) positionArrow(el); else hideArrow();
  if(ui.score) renderStaff($('#staffBox'),note,settings.staffNames);
  var fing=(lv.fing&&lv.fing[practice.idx])||0;
  var which=currentHand();
  if(ui.hand) setHandFinger(fing,which);
  if(ui.hand&&fing&&el) positionFingerChip(el,fing); else hideFingerChip();
  var tag=$('#handTag');
  if(tag){
    if(which){
      tag.hidden=false;
      tag.className=which==='I'?'ih':'dh';
      tag.textContent=which==='I'?'🫲 Mano izquierda':'🖐 Mano derecha';
    }else tag.hidden=true;
  }
}

function refreshTeach(){
  if(practice.active&&practice.level.ui&&practice.level.ui.score){
    var n=practice.level.notes[practice.idx];
    if(n) renderStaff($('#staffBox'),n,settings.staffNames);
  }
}

function clearHints(){for(var k in keyEls)keyEls[k].classList.remove('hint');}
function positionArrow(el){
  var pianoWrap=$('#pianoWrap');if(!pianoWrap)return;
  var r=el.getBoundingClientRect(),w=pianoWrap.getBoundingClientRect();
  var a=$('#hintArrow');if(!a)return;
  a.style.opacity='1';a.style.left=(r.left+r.width/2-w.left)+'px';
}
function hideArrow(){var a=$('#hintArrow');if(a)a.style.opacity='0';lastHintMidi=null;}
window.addEventListener('resize',function(){
  if(practice.active&&lastHintMidi!=null&&keyEls[lastHintMidi]){
    positionArrow(keyEls[lastHintMidi]);
    var lv=practice.level,fing=(lv.fing&&lv.fing[practice.idx])||0;
    if(lv.ui&&lv.ui.hand&&fing) positionFingerChip(keyEls[lastHintMidi],fing);
  }
});

function updatePracticeUI(){
  var total=practice.level.notes.length;
  if($('#progFill')) $('#progFill').style.width=(practice.idx/total*100)+'%';
  if($('#statProg')) $('#statProg').textContent=practice.idx+'/'+total;
  if($('#statStreak')) $('#statStreak').textContent=practice.streak+(practice.streak>=5?' 🔥':'');
  var tries=practice.hits+practice.misses;
  if($('#statAcc')) $('#statAcc').textContent=tries?Math.round(practice.hits/tries*100)+'%':'—';
}

function restartFromStart(){
  practice.intro=true;
  hideArrow();clearHints();hideFingerChip();
  showMsg('💪 Se superó el margen de fallos, Mateo.<br>¡Volvamos a empezar con calma, tú puedes!',3200,function(){
    if(!practice.active){practice.intro=false;return;}
    practice.idx=0;practice.hits=0;practice.misses=0;practice.streak=0;
    updatePracticeUI();
    practice.intro=false;
    practice.lastTouchT = performance.now();
    setHint(practice.level.notes[0]);
  });
}

/* ============ SISTEMA PERMISIVO DE ERRORES Y EVALUACIÓN DE RITMO ============ */
function judge(m){
  if(!practice.active||practice.demo||practice.intro)return;
  var now = performance.now();
  var expectedNote = practice.level.notes[practice.idx];
  var expectedMidi = expectedNote.midi;
  
  // Cálculo de umbral permisivo: al menos 3 fallos o 25% de la longitud de la canción
  var maxMissesAllowed = Math.max(3, Math.floor(practice.level.notes.length * 0.25));

  if(m===expectedMidi){
    // Evaluación de Ritmo (Tolerance ±35%)
    var expectedDurationMs = (expectedNote.dur * 60 / practice.level.bpm) * 1000;
    var deltaMs = now - practice.lastTouchT;
    practice.lastTouchT = now;
    
    if(practice.idx > 0 && Math.abs(deltaMs - expectedDurationMs) < (expectedDurationMs * 0.35)){
      toast('🎵 ¡Excelente ritmo!');
    }

    practice.hits++;practice.streak++;
    if(practice.streak>practice.bestStreak)practice.bestStreak=practice.streak;
    burst(m,true);
    if(practice.hits>0&&practice.hits%8===0) toast('🧘 '+rnd(DURING_TIPS));
    practice.idx++;
    updatePracticeUI();
    if(practice.idx>=practice.level.notes.length) finishPractice();
    else setHint(practice.level.notes[practice.idx]);
  }else{
    if(!settings.waitMode){
      practice.misses++;practice.streak=0;
    }
    var el=keyEls[m];
    if(el){el.classList.remove('err');void el.offsetWidth;el.classList.add('err');}
    var badge=$('#noteBadge');
    if(badge){badge.classList.add('bad');setTimeout(function(){badge.classList.remove('bad');},350);}
    
    if(!settings.waitMode){
      if(practice.misses >= maxMissesAllowed){ 
        updatePracticeUI(); restartFromStart(); return; 
      } else {
        toast('⚠️ Mateo, llevas '+practice.misses+' de '+maxMissesAllowed+' fallos permitidos.');
      }
    }
    updatePracticeUI();
  }
}

function finishPractice(){
  practice.active=false;hideArrow();clearHints();hideFingerChip();
  var tries=practice.hits+practice.misses;
  var acc=tries?Math.round(practice.hits/tries*100):100;
  var stars=acc>=92?3:(acc>=75?2:1);
  var prog=getPath();
  if(stars>(prog[practice.level.id]||0)) prog[practice.level.id]=stars;
  storeSet('pf_path',JSON.stringify(prog));
  var nowEarned=earnedBadges(prog);
  var prev=[];
  try{prev=JSON.parse(storeGet('pf_badges')||'[]');}catch(e){}
  var newOnes=nowEarned.filter(function(id){return prev.indexOf(id)<0;});
  storeSet('pf_badges',JSON.stringify(nowEarned));
  var rl=$('#rewardLine');
  if(rl){
    rl.innerHTML='';
    if(newOnes.length){
      rl.hidden=false;
      newOnes.forEach(function(id){
        var b=BADGES.filter(function(x){return x.id===id;})[0];
        var chip=document.createElement('div');chip.className='rewardChip';
        chip.innerHTML=b.icon+' ¡Recompensa para Mateo: '+b.name+'!';
        rl.appendChild(chip);
      });
    }else rl.hidden=true;
  }
  var stageNowDone=stageDoneIn(prog,practice.level.stage);
  var cheer=$('#cheerMsg');
  if(cheer){
    if(stars===3||practice.level.song||stageNowDone){
      cheer.hidden=false;
      cheer.textContent='💛 '+rnd(ENTHUSIASM);
    }else cheer.hidden=true;
  }
  if($('#afterTip')) $('#afterTip').textContent=rnd(POST_TIPS);
  var box=$('#starsBox');
  if(box){
    box.innerHTML='';
    for(var i=1;i<=3;i++){
      var sp=document.createElement('span');sp.textContent='★';
      if(i<=stars)sp.classList.add('on');
      box.appendChild(sp);
    }
  }
  if($('#mAcc')) $('#mAcc').textContent=acc+'%';
  if($('#mStreak')) $('#mStreak').textContent=practice.bestStreak;
  if($('#mHits')) $('#mHits').textContent=practice.hits;
  if($('#mMiss')) $('#mMiss').textContent=practice.misses;
  
  var idx=LEVELS.findIndex(function(l){return l.id===practice.level.id;});
  var nxt=LEVELS[idx+1]||null;
  var crossed=nxt&&nxt.stage>practice.level.stage;
  if($('#modalTitle')){
    if(!nxt) $('#modalTitle').textContent='🏆 ¡Curso completado, Mateo! ¡Pianista graduado!';
    else if(crossed) $('#modalTitle').textContent='🎊 ¡'+STAGES[nxt.stage-1].title+' desbloqueada, Mateo!';
    else $('#modalTitle').textContent='🎉 ¡Nivel completado, Mateo!';
  }
  if($('#nextBtn')){
    $('#nextBtn').textContent=!nxt?'🎓 Ver mi plan':(crossed?('🚀 ¡A la Etapa '+nxt.stage+'!'):'Siguiente nivel ▸');
    $('#nextBtn').onclick=function(){
      $('#modal').hidden=true;
      if(nxt) startPractice(nxt); else exitPractice();
    };
  }
  if($('#modal')) $('#modal').hidden=false;
  launchConfetti();
  if(newOnes.length) setTimeout(function(){launchConfetti();},600);
}

function closeToPath(){if($('#modal')) $('#modal').hidden=true;exitPractice();}
if($('#retryBtn')) $('#retryBtn').addEventListener('click',function(){
  var lv=practice.level;
  if($('#modal')) $('#modal').hidden=true;
  if(lv) startPractice(lv);
});

/* ============ MODO DEMO O AUDICIÓN ============ */
function playDemo(onDone){
  if(!practice.level)return;
  var my=++demoRun;
  practice.demo=true;
  $('#demoBtn').textContent='⏹ Detener';
  clearHints();hideArrow();hideFingerChip();
  var mult=parseFloat($('#tempoSel').value)||1;
  var i=0;
  function step(){
    if(my!==demoRun)return;
    if(i>=practice.level.notes.length){
      practice.demo=false;
      if(onDone){onDone();}
      else{
        $('#demoBtn').textContent='▶ Escuchar';
        if(practice.active) setHint(practice.level.notes[practice.idx]);
      }
      return;
    }
    var n=practice.level.notes[i++];
    var dur=n.dur*60/practice.level.bpm*1000/mult;
    triggerNote(n.midi,false,true);
    setTimeout(step,dur*.92);
  }
  step();
}
if($('#demoBtn')) $('#demoBtn').addEventListener('click',function(){
  var self=this;
  if(!practice.level||practice.intro)return;
  if(practice.demo){
    demoRun++;practice.demo=false;
    self.textContent='▶ Escuchar';
    if(practice.active) setHint(practice.level.notes[practice.idx]);
    return;
  }
  playDemo(null);
});

/* ============ GRABADOR DE SECUENCIAS ============ */
var rec={state:'idle',events:[],t0:0,timer:null,playing:false,timeouts:[]};
function fmt(ms){var s=Math.floor(ms/1000);return Math.floor(s/60)+':'+String(s%60).padStart(2,'0');}
function recordEvent(m){if(rec.state==='rec')rec.events.push({m:m,t:performance.now()-rec.t0});}
if($('#recBtn')) $('#recBtn').addEventListener('click',function(){
  if(rec.playing)return;
  if(rec.state==='idle'){
    rec.state='rec';rec.events=[];rec.t0=performance.now();
    this.textContent='⏹ Detener';
    $('#recStatus').className='rec';$('#recStatus').textContent='Grabando… 0:00';
    $('#playRecBtn').disabled=true;$('#clearRecBtn').disabled=true;
    rec.timer=setInterval(function(){$('#recStatus').textContent='Grabando… '+fmt(performance.now()-rec.t0);},250);
  }else{
    rec.state='idle';clearInterval(rec.timer);
    this.textContent='⏺ Grabar';
    $('#recStatus').className='';
    $('#recStatus').textContent=rec.events.length+' notas guardadas ✔';
    $('#playRecBtn').disabled=!rec.events.length;$('#clearRecBtn').disabled=!rec.events.length;
  }
});

function stopRecorderPlayback(){
  if(!rec.playing)return;
  rec.timeouts.forEach(clearTimeout);rec.timeouts=[];
  rec.playing=false;$('#recBtn').disabled=false;$('#playRecBtn').textContent='▶ Reproducir';
}
if($('#playRecBtn')) $('#playRecBtn').addEventListener('click',function(){
  if(rec.playing){stopRecorderPlayback();return;}
  if(!rec.events.length)return;
  rec.playing=true;rec.timeouts=[];
  this.textContent='⏹ Detener';$('#recBtn').disabled=true;
  rec.events.forEach(function(e){
    rec.timeouts.push(setTimeout(function(){triggerNote(e.m,false,true);},e.t));
  });
  var end=rec.events[rec.events.length-1].t+800;
  rec.timeouts.push(setTimeout(function(){
    rec.playing=false;$('#recBtn').disabled=false;$('#playRecBtn').textContent='▶ Reproducir';
  },end));
});
if($('#clearRecBtn')) $('#clearRecBtn').addEventListener('click',function(){
  rec.events=[];
  $('#playRecBtn').disabled=true;$('#clearRecBtn').disabled=true;
  $('#recStatus').textContent='Listo para grabar';
});

/* ============ ESTADÍSTICAS Y TIEMPO DE USO ============ */
var totalSec=parseInt(storeGet('pf_time')||'0',10)||0;
var sessionPracticeSec=0, notified15=false;

function getDailyStats(){
  try{ var d=JSON.parse(storeGet('pf_daily')); if(d&&d.history) return d; }catch(e){}
  return {history:{},streak:0,lastDate:""};
}
function saveDailyStats(d){ storeSet('pf_daily',JSON.stringify(d)); }

function updateDailyTime(secToAdd){
  var d=getDailyStats();
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
  d.history[todayStr] = (d.history[todayStr]||0) + secToAdd;
  saveDailyStats(d);
  
  var hs = $('#headerStreak');
  if(hs) hs.innerHTML = '🔥 ' + d.streak + (d.streak===1?' Día':' Días');
  return d;
}

function fmtTotal(sec){
  var m=Math.floor(sec/60);
  if(m<60) return m+' min';
  return Math.floor(m/60)+' h '+(m%60)+' min';
}
function paintTime(){ 
  if($('#timeChip')) $('#timeChip').textContent='⏱ '+fmtTotal(totalSec)+' practicados'; 
  var d=getDailyStats();
  var hs=$('#headerStreak');
  if(hs) hs.innerHTML = '🔥 ' + d.streak + (d.streak===1?' Día':' Días');
}

setInterval(function(){
  if(practice.active){
    sessionPracticeSec++; totalSec++;
    if(totalSec%10===0) storeSet('pf_time',String(totalSec));
    if(totalSec%10===0) updateDailyTime(10);
    if(sessionPracticeSec>=900&&!notified15){
      notified15=true;
      showMsg('🌟 ¡Mateo, llevas 15 minutos practicando!<br>Sigues avanzando súper bien. ¡Qué orgullo!',4200,null);
    }
  }
  paintTime();
},1000);
window.addEventListener('beforeunload',function(){
  storeSet('pf_time',String(totalSec));
  if(practice.level) storeSet('pf_last',String(practice.level.id));
  if(sessionPracticeSec%10 !== 0) updateDailyTime(sessionPracticeSec%10);
});

/* ============ MODAL ESTADÍSTICAS ============ */
if($('#statsBtn')) $('#statsBtn').addEventListener('click',function(){
  var d = getDailyStats();
  var today = new Date();
  var todayStr = new Date(today.getTime() - (today.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
  
  if($('#smStreak')) $('#smStreak').textContent = d.streak;
  var todaySec = d.history[todayStr]||0;
  if($('#smToday')) $('#smToday').textContent = Math.floor(todaySec/60) + ' min';
  if($('#smTotal')) $('#smTotal').textContent = fmtTotal(totalSec);
  
  var chart = $('#smChart');
  if(chart){
    chart.innerHTML = '';
    var maxSec = 1;
    var days = [];
    for(var i=6; i>=0; i--){
      var td = new Date(today.getTime() - (i * 24 * 60 * 60 * 1000));
      var ds = new Date(td.getTime() - (td.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
      var sec = d.history[ds]||0;
      if(sec > maxSec) maxSec = sec;
      var lbl = ['D','L','M','X','J','V','S'][td.getDay()];
      days.push({sec:sec, lbl:lbl});
    }
    
    days.forEach(function(day){
      var wrap = document.createElement('div');
      wrap.className = 'chartBarWrap';
      var pct = Math.max(2, (day.sec / maxSec) * 100);
      wrap.innerHTML = '<div class="chartBar" style="height:'+pct+'%" title="'+Math.floor(day.sec/60)+' min"></div><div class="chartLbl">'+day.lbl+'</div>';
      chart.appendChild(wrap);
    });
  }
  if($('#statsModal')) $('#statsModal').hidden = false;
});
if($('#closeStatsBtn')) $('#closeStatsBtn').addEventListener('click',function(){ if($('#statsModal')) $('#statsModal').hidden = true; });

/* ============ CONFETI DE RECOMPENSA ============ */
function launchConfetti(){
  var c=$('#confetti');if(!c)return;
  var colors=['#ffb547','#8b6cff','#3ddc84','#ff6b9d','#4dd0ff','#fff'];
  for(var i=0;i<90;i++){
    var d=document.createElement('i');
    d.style.left=Math.random()*100+'vw';
    d.style.background=colors[i%colors.length];
    var sz=(6+Math.random()*7)+'px';
    d.style.width=sz;d.style.height=sz;
    d.style.animationDelay=(Math.random()*.5)+'s';
    d.style.animationDuration=(2.3+Math.random()*1.8)+'s';
    c.appendChild(d);
    (function(el){setTimeout(function(){el.remove();},5000);})(d);
  }
}

/* ============ CONTROLES DE CONFIGURACIÓN ============ */
if($('#vol')) $('#vol').addEventListener('input',function(){
  settings.vol=this.value/100;
  if(master)master.gain.value=settings.vol;
  saveSettings();
});
if($('#sysSel')) $('#sysSel').addEventListener('change',function(){
  settings.sys=this.value;refreshLabels();saveSettings();refreshTeach();
});
if($('#tglNames')) $('#tglNames').addEventListener('change',function(){settings.names=this.checked;refreshLabels();saveSettings();});
if($('#tglHints')) $('#tglHints').addEventListener('change',function(){settings.hints=this.checked;refreshLabels();saveSettings();});
if($('#tglStaffNames')) $('#tglStaffNames').addEventListener('change',function(){settings.staffNames=this.checked;saveSettings();refreshTeach();});
if($('#tglWaitMode')) $('#tglWaitMode').addEventListener('change',function(){settings.waitMode=this.checked;saveSettings();});
if($('#tglSynthesia')) $('#tglSynthesia').addEventListener('change',function(){
  settings.synthesia=this.checked;saveSettings();
  if($('#fallingCanvas')) $('#fallingCanvas').hidden=!settings.synthesia;
  if(settings.synthesia) requestAnimationFrame(drawSynthesia);
});

/* ============ MOTOR DE SYNTHESIA ============ */
var synthCanvas=$('#fallingCanvas'), synthCtx=synthCanvas?synthCanvas.getContext('2d'):null;
var animY=0;
function drawSynthesia(){
  if(!settings.synthesia || !practice.active || !synthCtx) return;
  requestAnimationFrame(drawSynthesia);
  var w=synthCanvas.width=synthCanvas.offsetWidth;
  var h=synthCanvas.height=synthCanvas.offsetHeight;
  synthCtx.clearRect(0,0,w,h);
  
  var targetY=0;
  var pxPerBeat = 60;
  
  for(var i=0;i<practice.level.notes.length;i++){
    if(i<practice.idx) targetY += practice.level.notes[i].dur * pxPerBeat;
  }
  
  animY += (targetY - animY)*0.15;
  var pianoW = $('#piano').offsetWidth;
  var scaleX = w / pianoW;
  
  var accY = -animY;
  for(var j=0;j<practice.level.notes.length;j++){
    var n = practice.level.notes[j];
    var hBlock = n.dur * pxPerBeat;
    
    if(accY+hBlock > 0 && accY < h){
      var el = keyEls[n.midi];
      if(el){
        var rect = el.getBoundingClientRect();
        var pianoRect = $('#piano').getBoundingClientRect();
        var left = (rect.left - pianoRect.left)*scaleX;
        var bWidth = rect.width*scaleX * 0.8;
        
        var drawY = h - (accY + hBlock) - 10;
        synthCtx.fillStyle = (j===practice.idx) ? '#3ddc84' : (j<practice.idx ? '#6a7089' : '#ffb547');
        synthCtx.beginPath();
        synthCtx.roundRect(left + rect.width*scaleX*0.1, drawY, bWidth, Math.max(10, hBlock-2), 4);
        synthCtx.fill();
      }
    }
    accY += hBlock;
  }
}

/* ============ PWA: SERVICE WORKER & INSTALACIÓN ============ */
if('serviceWorker' in navigator){
  window.addEventListener('load',function(){
    navigator.serviceWorker.register('sw.js').catch(function(){});
  });
}
var deferredPrompt=null;
window.addEventListener('beforeinstallprompt',function(e){
  e.preventDefault();
  deferredPrompt=e;
  var b=document.getElementById('installBtn');
  if(b)b.hidden=false;
});
if(document.getElementById('installBtn')){
  document.getElementById('installBtn').addEventListener('click',function(){
    var b=this;
    if(!deferredPrompt)return;
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(function(){deferredPrompt=null;b.hidden=true;});
  });
}

/* ============ INICIALIZACIÓN DE LA APLICACIÓN ============ */
if($('#vol')) $('#vol').value=Math.round(settings.vol*100);
if($('#sysSel')) $('#sysSel').value=settings.sys;
if($('#tglNames')) $('#tglNames').checked=settings.names;
if($('#tglHints')) $('#tglHints').checked=settings.hints;
if($('#tglStaffNames')) $('#tglStaffNames').checked=settings.staffNames;
var twm=$('#tglWaitMode'); if(twm) twm.checked=settings.waitMode;
var tsy=$('#tglSynthesia'); if(tsy) tsy.checked=settings.synthesia;
if(settings.synthesia && $('#fallingCanvas')){
  $('#fallingCanvas').hidden=false;
  requestAnimationFrame(drawSynthesia);
}
refreshLabels();
renderPath();
paintTime();
setMode('learn');

/* ============ PANTALLA DE CARGA (LOADER) ============ */
(function(){
  var pct=0;
  var fill=document.getElementById('loadFill');
  var txt=document.getElementById('loadPct');
  var iv=setInterval(function(){
    pct=Math.min(100,pct+2);
    if(fill)fill.style.width=pct+'%';
    if(txt)txt.textContent=pct+'%';
    if(pct>=100){
      clearInterval(iv);
      var l=document.getElementById('loader');
      if(l){
        l.classList.add('gone');
        setTimeout(function(){ if(l.parentNode)l.parentNode.removeChild(l); },700);
      }
    }
  },30);
})();

