/* ==========================================================================
   PIANOFÁCIL PRO · MÓDULO 6: CASCADA DE NOTAS SYNTHESIA NEÓN
   PianoFácil PRO · js/synthesia.js
   ========================================================================== */

var synthCanvas = $('#fallingCanvas');
var synthCtx = synthCanvas ? synthCanvas.getContext('2d') : null;
var animY = 0;

function drawSynthesia(){
  if(!settings.synthesia || !practice || !practice.active || !synthCtx) return;
  requestAnimationFrame(drawSynthesia);
  var w = synthCanvas.width = synthCanvas.offsetWidth;
  var h = synthCanvas.height = synthCanvas.offsetHeight;
  synthCtx.clearRect(0, 0, w, h);
  
  var targetY = 0;
  var pxPerBeat = 65;
  
  if(!practice.level || !practice.level.notes) return;

  for(var i = 0; i < practice.level.notes.length; i++){
    if(i < practice.idx) targetY += practice.level.notes[i].dur * pxPerBeat;
  }
  
  animY += (targetY - animY) * 0.15;
  var pianoEl = $('#piano');
  if(!pianoEl) return;
  var pianoW = pianoEl.offsetWidth;
  var scaleX = w / (pianoW || 1);
  
  var accY = -animY;
  for(var j = 0; j < practice.level.notes.length; j++){
    var n = practice.level.notes[j];
    var hBlock = n.dur * pxPerBeat;
    
    if(accY + hBlock > 0 && accY < h){
      var el = keyEls[n.midi];
      if(el){
        var rect = el.getBoundingClientRect();
        var pianoRect = pianoEl.getBoundingClientRect();
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
