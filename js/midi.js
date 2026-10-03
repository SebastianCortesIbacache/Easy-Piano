/* ==========================================================================
   PIANOFÁCIL PRO · MÓDULO 4: GESTOR DE ENTRADA WEB MIDI (USB / BLUETOOTH)
   PianoFácil PRO · js/midi.js
   Soporte plug-and-play para teclados y pianos digitales con latencia cero.
   ========================================================================== */

var MIDI = (function(){
  'use strict';

  var _access = null;
  var _supported = !!(navigator && navigator.requestMIDIAccess);
  var _connected = false;
  var _devices = [];
  var _activeNotes = {};
  var _synthSound = true; // Por defecto reproduce síntesis de la app si el teclado es mudo
  var _active = false;

  function isSupported(){
    return _supported;
  }

  function isConnected(){
    return _connected;
  }

  function getDeviceList(){
    return _devices.slice();
  }

  function setSynthSound(enabled){
    _synthSound = !!enabled;
    storeSet('pf_midi_synth', _synthSound ? '1' : '0');
  }

  function getSynthSound(){
    return _synthSound;
  }

  function init(){
    // Cargar preferencia de sonido de síntesis
    var savedSynth = storeGet('pf_midi_synth');
    if(savedSynth !== null){
      _synthSound = (savedSynth === '1');
    }

    if(!_supported){
      console.info('[MIDI] Web MIDI API no soportada en este entorno.');
      updateUI();
      return;
    }

    // Solicitar acceso a MIDI sin sysex (modo estándar de audio)
    try {
      navigator.requestMIDIAccess({ sysex: false })
        .then(function(access){
          _access = access;
          _access.onstatechange = onStateChange;
          scanInputs();
          updateUI();
        })
        .catch(function(err){
          console.warn('[MIDI] Acceso denegado o no disponible:', err);
          updateUI();
        });
    } catch(e){
      console.warn('[MIDI] Error al invocar requestMIDIAccess:', e);
      updateUI();
    }
  }

  function onStateChange(e){
    scanInputs();
    updateUI();
    if(e && e.port){
      if(e.port.state === 'connected'){
        toast('🎹 Teclado MIDI conectado: ' + (e.port.name || 'Dispositivo USB'));
        if(typeof setAvatarState === 'function'){
          setAvatarState('happy', '¡Genial! Conectaste tu teclado ' + (e.port.name || 'MIDI') + ' 🎹✨', 2500);
        }
      } else if(e.port.state === 'disconnected'){
        toast('🔌 Teclado MIDI desconectado');
      }
    }
  }

  function scanInputs(){
    if(!_access) return;
    _devices = [];
    var inputs = _access.inputs.values();
    var hasInputs = false;

    for(var input of inputs){
      hasInputs = true;
      var name = input.name || 'Teclado MIDI Genérico';
      if(_devices.indexOf(name) === -1) _devices.push(name);
      // Evitar registrar listeners duplicados
      input.onmidimessage = handleMidiMessage;
    }

    _connected = hasInputs;
  }

  function handleMidiMessage(event){
    var data = event.data;
    if(!data || data.length < 2) return;

    var status = data[0];
    var cmd = status >> 4;
    var note = data[1];
    var velocity = data.length > 2 ? data[2] : 0;

    // Solo procesar si el modo activo es MIDI o estamos en modo de práctica
    var currentMode = storeGet('pf_input_mode') || 'virtual';
    if(currentMode !== 'midi' && currentMode !== 'virtual') return;

    // Comando 9 = Note On (con velocity > 0)
    if(cmd === 9 && velocity > 0){
      _activeNotes[note] = velocity;
      onMidiNoteOn(note, velocity);
    }
    // Comando 8 = Note Off, o Comando 9 con velocity 0
    else if(cmd === 8 || (cmd === 9 && velocity === 0)){
      delete _activeNotes[note];
      onMidiNoteOff(note);
    }
  }

  function onMidiNoteOn(midi, velocity){
    // Si estamos en la app y el modo es MIDI, silenciamos el sintetizador si el usuario tiene su propio sonido
    var silent = !_synthSound;
    
    // Disparar la nota a través del motor central de piano.js
    if(typeof triggerNote === 'function'){
      triggerNote(midi, silent, false);
    }

    // Actualizar indicador visual de nota en osciloscopio o HUD
    var pc = typeof midiToPC === 'function' ? midiToPC(midi) : '';
    var dn = document.getElementById('detNote');
    var dh = document.getElementById('detHz');
    if(dn && pc) dn.textContent = (settings && settings.sys === 'solfege' && typeof SOL !== 'undefined') ? SOL[pc] : pc;
    if(dh && pc) dh.textContent = pc + (typeof midiToOct === 'function' ? midiToOct(midi) : '') + ' · MIDI #' + midi;
  }

  function onMidiNoteOff(midi){
    // Manejo de liberación de tecla si fuera necesario
    var el = (typeof keyEls !== 'undefined') ? keyEls[midi] : null;
    if(el && !el._manualHold){
      el.classList.remove('down');
    }
  }

  function updateUI(){
    var isbMidiBtn = document.getElementById('inputModeMidi');
    var isbMidiDot = document.getElementById('isbMidiIndicator');
    var isbMidiSub = document.getElementById('isbMidiStatusTxt');
    var midiPanelStatus = document.getElementById('midiPanelStatus');
    var midiDeviceSelect = document.getElementById('midiDeviceList');

    if(!_supported){
      if(isbMidiSub) isbMidiSub.textContent = 'No soportado';
      if(isbMidiDot) isbMidiDot.className = 'isbDot on-err';
      if(midiPanelStatus) midiPanelStatus.textContent = 'Web MIDI API no disponible en este navegador.';
      return;
    }

    if(_connected && _devices.length > 0){
      var devName = _devices[0];
      if(isbMidiSub) isbMidiSub.textContent = 'Listo: ' + (devName.length > 14 ? devName.substring(0, 12) + '…' : devName);
      if(isbMidiDot){
        isbMidiDot.hidden = false;
        isbMidiDot.className = 'isbDot on-good';
      }
      if(midiPanelStatus){
        midiPanelStatus.innerHTML = '🟢 <b>Conectado:</b> ' + _devices.join(', ');
      }
    } else {
      if(isbMidiSub) isbMidiSub.textContent = 'USB o Bluetooth';
      if(isbMidiDot){
        isbMidiDot.hidden = false;
        isbMidiDot.className = 'isbDot on-idle';
      }
      if(midiPanelStatus){
        midiPanelStatus.innerHTML = '⚪ <b>Esperando conexión:</b> Conecta tu teclado con cable USB o Bluetooth MIDI.';
      }
    }
  }

  return {
    init: init,
    isSupported: isSupported,
    isConnected: isConnected,
    getDeviceList: getDeviceList,
    setSynthSound: setSynthSound,
    getSynthSound: getSynthSound,
    updateUI: updateUI
  };
})();

// Inicializar automáticamente cuando el DOM esté listo
if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', MIDI.init);
} else {
  MIDI.init();
}
