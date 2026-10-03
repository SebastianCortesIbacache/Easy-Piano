/* ============ FRASES Y MENSAJES ============ */
var PRE_TIPS=[
 'Siéntate en la mitad del banco, con la espalda recta como un superhéroe 🦸',
 'Manos en forma de garra, como sosteniendo una pelotita 🎾',
 'Relaja los hombros y las muñecas antes de empezar 🌬️',
 'Respira profundo tres veces: la música empieza tranquilo 😌',
 'Toca con las puntas de los dedos, no con el dedo plano 👆',
 'Los pies bien apoyados en el suelo te dan equilibrio 🪑'
];
var POST_TIPS=[
 '🧘 Sacude y estira tus manos suavemente. ¡Se lo ganaron!',
 '👏 ¡Choca esos cinco! Tus dedos hicieron un gran trabajo.',
 '🌬️ Respira profundo: descansar también es practicar.',
 '💧 Buen momento para tomar agüita y relajar las muñecas.',
 '🎩 Un pianista de verdad también descansa con estilo. ¡Bien hecho!'
];
var DURING_TIPS=[
 'Muñecas relajadas 😉','Hombros abajo y tranquilos 💪','Dedos curvados como garrita 🎾',
 'Espalda recta de superhéroe 🦸','Respira mientras tocas 🌬️','Tranquilo: la música no corre 🐢'
];
var ENTHUSIASM=[
 '¡Sigue así, vamos avanzando súper bien! 🚀',
 '¡Tu familia estará muy orgullosa al escucharte tocar! 🥹',
 '¡A todos les encantará esta melodía! 🎶',
 '¿Alguien te está escuchando? ¡Se van a deleitar con tu talento! 🌟',
 '¡Bravo! Un aplauso fuerte para ti 👏',
 '¡Cada día suenas mejor! Eres un verdadero concertista 💛',
 '¡Qué bárbaro! Todos van a querer que les enseñes 🎹',
 '¡Vas a tocar el piano como todo un profesional! 😎'
];
function rnd(a){return a[Math.floor(Math.random()*a.length)];}

/* ============ NOTAS Y TECLADO ============ */
var NOTE_IDX={C:0,D:2,E:4,F:5,G:7,A:9,B:11};
var PC_SHARP=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
var SOL={C:'Do','C#':'Do#',D:'Re','D#':'Re#',E:'Mi',F:'Fa','F#':'Fa#',G:'Sol','G#':'Sol#',A:'La','A#':'La#',B:'Si'};
var FIRST=48, LAST=84;
var FING_NAMES=['','Pulgar','Índice','Medio','Anular','Meñique'];
function nameToMidi(n){var m=n.match(/^([A-G])(#?)(\d)$/);return 12*(+m[3]+1)+NOTE_IDX[m[1]]+(m[2]?1:0);}
function midiToPC(m){return PC_SHARP[((m%12)+12)%12];}
function midiToOct(m){return Math.floor(m/12)-1;}
var KEYMAP={'1':48,'2':50,'3':52,'4':53,'5':55,'6':57,'7':59,
 a:60,w:61,s:62,e:63,d:64,f:65,t:66,g:67,y:68,h:69,u:70,j:71,
 k:72,o:73,l:74,p:75,'ñ':76,';':76,z:77,x:78,c:79,v:80,b:81,n:82,m:83,',':84};
var MIDITOKEY={};
for(var kk in KEYMAP){ if(!(KEYMAP[kk] in MIDITOKEY)) MIDITOKEY[KEYMAP[kk]]=kk; }

/* ============ CANCIONES BASE ============ */
var MARTINILLO=[['C4',1],['D4',1],['E4',1],['C4',1],['C4',1],['D4',1],['E4',1],['C4',1],
 ['E4',1],['F4',1],['G4',2],['E4',1],['F4',1],['G4',2],
 ['G4',.5],['A4',.5],['G4',.5],['F4',.5],['E4',1],['C4',1],
 ['G4',.5],['A4',.5],['G4',.5],['F4',.5],['E4',1],['C4',1],
 ['C4',1],['G4',1],['C4',3]];
var ESTRELLITA=[['C4',1],['C4',1],['G4',1],['G4',1],['A4',1],['A4',1],['G4',2],
 ['F4',1],['F4',1],['E4',1],['E4',1],['D4',1],['D4',1],['C4',2],
 ['G4',1],['G4',1],['F4',1],['F4',1],['E4',1],['E4',1],['D4',2],
 ['G4',1],['G4',1],['F4',1],['F4',1],['E4',1],['E4',1],['D4',2],
 ['C4',1],['C4',1],['G4',1],['G4',1],['A4',1],['A4',1],['G4',2],
 ['F4',1],['F4',1],['E4',1],['E4',1],['D4',1],['D4',1],['C4',2]];
var HIMNO=[['E4',1],['E4',1],['F4',1],['G4',1],['G4',1],['F4',1],['E4',1],['D4',1],
 ['C4',1],['C4',1],['D4',1],['E4',1],['E4',1.5],['D4',.5],['D4',2],
 ['E4',1],['E4',1],['F4',1],['G4',1],['G4',1],['F4',1],['E4',1],['D4',1],
 ['C4',1],['C4',1],['D4',1],['E4',1],['D4',1.5],['C4',.5],['C4',2]];
var CUMPLE=[['C4',.75],['C4',.25],['D4',1],['C4',1],['F4',1],['E4',2],
 ['C4',.75],['C4',.25],['D4',1],['C4',1],['G4',1],['F4',2],
 ['C4',.75],['C4',.25],['C5',1],['A4',1],['F4',1],['E4',1],['D4',2],
 ['A#4',.75],['A#4',.25],['A4',1],['F4',1],['G4',1],['F4',2]];
var NOCHE=[['G4',1.5],['A4',.5],['G4',1],['E4',2],['G4',1.5],['A4',.5],['G4',1],['E4',2],
 ['D5',2],['D5',1],['B4',3],['C5',2],['C5',1],['G4',3],
 ['A4',2],['A4',1],['C5',1.5],['B4',.5],['A4',1],['G4',1.5],['A4',.5],['G4',1],['E4',2],
 ['A4',2],['A4',1],['C5',1.5],['B4',.5],['A4',1],['G4',1.5],['A4',.5],['G4',1],['E4',2],
 ['C5',2],['G4',1],['E4',1.5],['G4',.5],['F4',1],['D4',1],['C4',3]];
var CAMPANITAS=[['E4',1],['E4',1],['E4',2],['E4',1],['E4',1],['E4',2],['E4',1],['G4',1],['C4',1],['D4',1],['E4',4],
 ['F4',1],['F4',1],['F4',1],['F4',1],['F4',1],['E4',1],['E4',1],['E4',1],['E4',1],['D4',1],['D4',1],['E4',1],['D4',2],['G4',2],
 ['E4',1],['E4',1],['E4',2],['E4',1],['E4',1],['E4',2],['E4',1],['G4',1],['C4',1],['D4',1],['E4',4],
 ['F4',1],['F4',1],['F4',1],['F4',1],['F4',1],['E4',1],['E4',1],['E4',1],['G4',1],['G4',1],['F4',1],['D4',1],['C4',4]];
var SAINTS=[['C4',1],['E4',1],['F4',1],['F4',2],['C4',1],['E4',1],['F4',1],['F4',2],
 ['E4',1],['D4',1],['E4',1],['F4',1],['E4',1],['D4',1],['C4',3]];
var GREENS=[['A4',1],['C5',2],['D5',1],['E5',1.5],['F5',.5],['E5',1],['D5',2],['B4',1],
 ['G4',1.5],['A4',.5],['B4',1],['C5',1.5],['A4',.5],['A4',1],['G4',2],['E4',1],
 ['A4',1],['C5',2],['D5',1],['E5',1.5],['F5',.5],['E5',1],['D5',2],['B4',1],
 ['G4',1.5],['A4',.5],['B4',1],['C5',1.5],['B4',.5],['C5',1],['D5',2],['B4',1],
 ['E5',1.5],['F5',.5],['E5',1],['D5',2],['B4',1],['A4',3]];
var FUR=[['E5',.5],['D#5',.5],['E5',.5],['D#5',.5],['E5',.5],['B4',.5],['D5',.5],['C5',.5],['A4',1],
 ['C4',.5],['E4',.5],['A4',.5],['B4',1],['E4',.5],['G#4',.5],['B4',.5],['C5',1],['E4',.5],
 ['E5',.5],['D#5',.5],['E5',.5],['D#5',.5],['E5',.5],['B4',.5],['D5',.5],['C5',.5],['A4',1],
 ['C4',.5],['E4',.5],['A4',.5],['B4',1],['E4',.5],['C5',.5],['B4',.5],['A4',2]];
var MINUET=[['D5',1],['G4',.5],['A4',.5],['B4',.5],['C5',.5],['D5',1],['G4',1],['G4',1],
 ['E5',1],['C5',.5],['D5',.5],['E5',.5],['F#5',.5],['G5',1],['G4',1],['G4',1]];
var CANON=[['F#5',1],['E5',1],['D5',1],['C#5',1],['B4',1],['A4',1],['B4',1],['C#5',1],
 ['D5',1],['C#5',1],['B4',1],['A4',1],['G4',1],['F#4',1],['G4',1],['E4',1],
 ['D4',1],['A4',1],['D5',2]];
var BAJOMELO=[['C3',1],['C4',1],['E4',1],['G4',1],['G3',1],['G4',1],['B4',1],['D5',1],
 ['F3',1],['F4',1],['A4',1],['C5',1],['C3',1],['E4',1],['G4',1],['C5',2]];
var VALS=[['C3',1],['G4',1],['E4',1],['C3',1],['G4',1],['E4',1],['F3',1],['A4',1],['F4',1],
 ['G3',1],['B4',1],['G4',1],['C3',1],['G4',1],['E4',1],['C3',1],['E4',1],['C4',1]];
var NOCHE2=[['C3',1],['G4',1.5],['A4',.5],['G4',1],['E4',2],['C3',1],['G4',1.5],['A4',.5],['G4',1],['E4',2],
 ['G3',1],['D5',2],['D5',1],['B4',3],['C3',1],['C5',2],['C5',1],['G4',3],
 ['F3',1],['A4',2],['A4',1],['C5',1.5],['B4',.5],['A4',1],['C3',1],['G4',1.5],['A4',.5],['G4',1],['E4',2],
 ['F3',1],['A4',2],['A4',1],['C5',1.5],['B4',.5],['A4',1],['C3',1],['G4',1.5],['A4',.5],['G4',1],['E4',2],
 ['C3',1],['C5',2],['G4',1],['E4',1.5],['G4',.5],['F4',1],['D4',1],['C4',3]];
var HIMNO2=[['C3',1],['E4',1],['E4',1],['F4',1],['G4',1],['G3',1],['G4',1],['F4',1],['E4',1],['D4',1],
 ['C3',1],['C4',1],['C4',1],['D4',1],['E4',1],['G3',1],['E4',1],['D4',1],['D4',2],
 ['C3',1],['E4',1],['E4',1],['F4',1],['G4',1],['G3',1],['G4',1],['F4',1],['E4',1],['D4',1],
 ['C3',1],['C4',1],['C4',1],['D4',1],['E4',1],['C3',1],['D4',1],['C4',1],['C4',2]];
var CAMP2=[['C3',1],['E4',1],['E4',1],['E4',2],['C3',1],['E4',1],['E4',1],['E4',2],
 ['G3',1],['E4',1],['G4',1],['C3',1],['C4',1],['D4',1],['E4',2],
 ['F3',1],['F4',1],['F4',1],['F4',2],['C3',1],['F4',1],['E4',1],['E4',2],
 ['G3',1],['G4',1],['G4',1],['F4',1],['D4',1],
 ['C3',1],['C4',1],['E4',1],['G4',1],['C5',3]];
var GRANFINAL=[['C3',1],['C4',1],['E4',1],['G4',1],['C5',1],
 ['C3',1],['E4',1],['E4',1],['F4',1],['G4',1],['G3',1],['G4',1],['F4',1],['E4',1],['D4',1],
 ['C3',1],['C4',1],['C4',1],['G4',1],['G4',1],
 ['F3',1],['F4',1],['E4',1],['D4',1],['C4',1],
 ['C3',1],['E4',1],['G4',1],['C5',3]];
var FING_MART=[1,2,3,1, 1,2,3,1, 1,2,3, 1,2,3, 3,4,3,2,1,1, 3,4,3,2,1,1, 1,5,1];
var FING_EST=[1,1,5,5,5,5,4, 3,3,2,2,1,1,1, 5,5,4,4,3,3,2, 5,5,4,4,3,3,2, 1,1,5,5,5,5,4, 3,3,2,2,1,1,1];
var FING_HIM=[3,3,4,5,5,4,3,2,1,1,2,3,3,2,1, 3,3,4,5,5,4,3,2,1,1,2,3,2,1,1];
var FING_CUM=[1,1,2,1,4,3, 1,1,2,1,5,4, 1,1,5,4,3,2,1, 4,4,3,1,2,1];
var FING_NOCHE=[3,4,3,1, 3,4,3,1, 4,4,2, 3,3,1, 1,1,3,2,1, 3,4,3,1, 1,1,3,2,1, 3,4,3,1, 5,3,1,3,2,1,1];
var FING_CAMP=[3,3,3,3,3,3,3,5,1,2,3, 4,4,4,4,4,3,3,3,3,2,2,3,2,5, 3,3,3,3,3,3,3,5,1,2,3, 4,4,4,4,4,3,3,3,5,5,4,2,1];
var FING_SAINTS=[1,2,3,3, 1,2,3,3, 2,1,2,3,2,1,1];
var FING_GREENS=[1,2,3,4,5,4,3,2, 1,2,3,4,3,3,2,1, 1,2,3,4,5,4,3,2, 1,2,3,4,3,4,5,3, 4,5,4,3,2,1];
var FING_FUR=[3,2,3,2,3,1,4,3,1, 1,2,4,5,1,3,4,5,2, 3,2,3,2,3,1,4,3,1, 1,2,4,5,1,5,4,3];
var FING_MINUET=[5,1,2,3,4,5,1,1, 5,3,4,5,4,5,1,1];
var FING_CANON=[5,4,3,2,1,1,2,3, 5,4,3,2,1,2,3,1, 1,3,5];
function handsAlt(n,pattern){var out=[];for(var i=0;i<n;i++)out.push(pattern[i%pattern.length]);return out;}
var H_BAJOMELO=handsAlt(16,['I','D','D','D']);
var H_VALS=handsAlt(18,['I','D','D']);
var H_NOCHE2=NOCHE2.map(function(x){return ['C3','G3','F3'].indexOf(x[0])>=0?'I':'D';});
var H_HIMNO2=HIMNO2.map(function(x){return ['C3','G3'].indexOf(x[0])>=0?'I':'D';});
var H_CAMP2=CAMP2.map(function(x){return ['C3','G3','F3'].indexOf(x[0])>=0?'I':'D';});
var H_GRANFINAL=GRANFINAL.map(function(x){return ['C3','G3','F3'].indexOf(x[0])>=0?'I':'D';});

/* ============ CANCIONES BONUS V2 ============ */
var SMARIO=[['E5',.5],['E5',1],['E5',1],['C5',.5],['E5',1],['G5',2],['G4',2],
 ['C5',1.5],['G4',1.5],['E4',1.5],['A4',1],['B4',1],['A#4',.5],['A4',1],
 ['G4',.7],['E5',.7],['G5',.7],['A5',1],['F5',.5],['G5',1],['E5',1],['C5',.5],['D5',.5],['B4',1.5]];
var HPOTTER=[['B4',1],['E5',1.5],['G5',.5],['F#5',1],['E5',2],['B5',1],['A5',2.5],['F#5',2.5],
 ['E5',1.5],['G5',.5],['F#5',1],['D5',2],['F5',1],['B4',3]];
var BSHARK=[['D4',1],['E4',1],['G4',.5],['G4',.5],['G4',.5],['G4',.5],['G4',.5],['G4',.5],['G4',.5],
 ['D4',1],['E4',1],['G4',.5],['G4',.5],['G4',.5],['G4',.5],['G4',.5],['G4',.5],['G4',.5],
 ['D4',1],['E4',1],['G4',.5],['G4',.5],['G4',.5],['G4',.5],['G4',.5],['G4',.5],['G4',.5],['G4',1],['F#4',2]];
var PIRATAS=[['A4',.5],['C5',.5],['D5',1],['D5',1],['D5',.5],['E5',.5],['F5',1],['F5',1],
 ['F5',.5],['G5',.5],['E5',1],['E5',1],['D5',.5],['C5',.5],['C5',.5],['D5',1.5]];

var FING_SMARIO=[3,3,3,1,3,5,1, 3,1,1,3,4,3,3, 1,3,5,5,4,5,3,1,2,1];
var FING_HPOTTER=[1,3,5,4,3,5,4,2, 3,5,4,1,3,1];
var FING_BSHARK=[1,2,4,4,4,4,4,4,4, 1,2,4,4,4,4,4,4,4, 1,2,4,4,4,4,4,4,4,4,3];
var FING_PIRATAS=[1,2,3,3,3,4,5,5, 5,5,4,4,3,2,2,3];

/* ============ ETAPAS Y NIVELES ============ */
var STAGES=[
 {id:1,emoji:'🌱',title:'Etapa 1 · Primeros pasos',desc:'Tus dos primeras lecciones: conoce el piano sin miedo.'},
 {id:2,emoji:'🖐',title:'Etapa 2 · Postura y técnica',desc:'Numera tus dedos, relaja la mano y aprende la digitación correcta.'},
 {id:3,emoji:'📖',title:'Etapa 3 · Lectura musical',desc:'Aprende a leer notas y ritmos en el pentagrama.'},
 {id:4,emoji:'🚀',title:'Etapa 4 · Melodías reales',desc:'Escalas, arpegios y tus primeras canciones completas.'},
 {id:5,emoji:'🫲',title:'Etapa 5 · La mano izquierda',desc:'Despierta tu mano secreta y alterna las dos manos.'},
 {id:6,emoji:'✨',title:'Etapa 6 · Canciones mágicas',desc:'🔓 Melodías famosas que todos reconocen: ¡se desbloquean al llegar aquí!'},
 {id:7,emoji:'🤲',title:'Etapa 7 · Dos manos',desc:'Bajos y melodía trabajando en equipo por primera vez.'},
 {id:8,emoji:'🔥',title:'Etapa 8 · Desafíos virtuosos',desc:'Los clásicos más famosos del piano, con sostenidos y velocidad.'},
 {id:9,emoji:'🎓',title:'Etapa 9 · Gran concierto',desc:'Tus versiones de concierto. ¡La graduación final!'}
];
var LEVELS=[
 {id:1,stage:1,title:'Tu primera nota',emoji:'👋',desc:'Toca Do (C4) tres veces, sin prisa.',bpm:80,
  lesson:'Siéntate frente al centro del piano, con la espalda recta y los hombros relajados. 🪑',
  seq:[['C4',1],['C4',1],['C4',1]]},
 {id:2,stage:1,title:'Do y Mi',emoji:'🌱',desc:'Alterna entre Do y Mi.',bpm:85,seq:[['C4',1],['E4',1],['C4',1],['E4',1]]},
 {id:3,stage:2,title:'Conoce tus dedos',emoji:'🖐',desc:'Cada dedo tiene un número y una tecla.',bpm:80,ui:{hand:true,handGuide:'hand_pov_right_1to5.jpg'},fing:[1,2,3,4,5],
  lesson:'Los dedos se numeran del 1 al 5: 1 = pulgar 👍, 2 = índice, 3 = medio, 4 = anular y 5 = meñique. Mira la guía en perspectiva.',
  seq:[['C4',1],['D4',1],['E4',1],['F4',1],['G4',1]]},
 {id:4,stage:2,title:'La mano en garra',emoji:'🎾',desc:'Sube y baja con la mano relajada.',bpm:85,ui:{hand:true,handGuide:'hand_pov_dome_claw.jpg'},fing:[1,2,3,4,5,4,3,2,1],
  lesson:'<div style="text-align:center;margin-bottom:8px"><img src="piano_hand_posture_1786427260354.png" style="max-width:100%;height:auto;border-radius:12px;border:1px solid #ffffff33;max-height:160px"></div>Curva los dedos como si sostuvieras una pelota pequeña 🎾. La muñeca está relajada y tocas con las puntas de los dedos.',
  seq:[['C4',1],['D4',1],['E4',1],['F4',1],['G4',1],['F4',1],['E4',1],['D4',1],['C4',1]]},
 {id:5,stage:2,title:'Dedos independientes',emoji:'🕺',desc:'Pequeños giros con grupos de dedos.',bpm:90,ui:{hand:true,handGuide:'hand_pov_finger_independence.jpg'},fing:[1,2,3,2,1, 2,3,4,3,2, 3,4,5,4,3],
  lesson:'Cada dedo se mueve por su cuenta mientras la mano permanece tranquila. Solo se mueven los dedos, no la muñeca.',
  seq:[['C4',1],['D4',1],['E4',1],['D4',1],['C4',1],['D4',1],['E4',1],['F4',1],['E4',1],['D4',1],['E4',1],['F4',1],['G4',1],['F4',1],['E4',1]]},
 {id:6,stage:2,title:'El pulgar por debajo',emoji:'🌉',desc:'El truco secreto de las escalas.',bpm:90,ui:{hand:true,handGuide:'hand_pov_thumb_under.jpg'},fing:[1,2,3,1,2, 2,1,3,2,1],
  lesson:'Para llegar al Fa, el pulgar (1) pasa por debajo del dedo medio (3): el famoso "paso del pulgar" ✨.',
  seq:[['C4',1],['D4',1],['E4',1],['F4',1],['G4',1],['F4',1],['E4',1],['D4',1],['C4',1],['C4',2]]},
 {id:7,stage:2,title:'Escala con digitación',emoji:'🏆',desc:'Do mayor completa con los dedos correctos.',bpm:96,ui:{hand:true,handGuide:'hand_pov_right_1to5.jpg'},fing:[1,2,3,1,2,3,4,5,4,3,2,1,3,2,1],
  lesson:'Digitación oficial de la escala de Do: sube 1-2-3-1-2-3-4-5 y baja 5-4-3-2-1-3-2-1. ¡La usarás toda la vida!',
  seq:[['C4',1],['D4',1],['E4',1],['F4',1],['G4',1],['A4',1],['B4',1],['C5',1],['B4',1],['A4',1],['G4',1],['F4',1],['E4',1],['D4',1],['C4',2]]},
 {id:8,stage:3,title:'El pentagrama y la clave de Sol',emoji:'📖',desc:'El Sol vive en la segunda línea.',bpm:80,ui:{score:true},
  lesson:'El pentagrama tiene 5 líneas que se cuentan desde abajo. La clave de Sol 𝄞 marca la segunda línea: ahí vive la nota Sol.',
  seq:[['G4',1],['G4',1],['G4',2],['E4',1],['E4',1],['E4',2]]},
 {id:9,stage:3,title:'Las notas en los espacios',emoji:'🔲',desc:'Fa y La viven en los espacios.',bpm:85,ui:{score:true},
  lesson:'Las notas también viven en los espacios entre líneas. Fa está en el primer espacio (abajo) y La en el segundo.',
  seq:[['F4',1],['F4',1],['A4',1],['A4',1],['F4',1],['A4',2]]},
 {id:10,stage:3,title:'Mi y Si en las líneas',emoji:'📏',desc:'Primera y tercera línea.',bpm:85,ui:{score:true},
  lesson:'Mi está en la primera línea (la de abajo del todo) y Si en la tercera línea, justo en el medio del pentagrama.',
  seq:[['E4',1],['G4',1],['B4',1],['G4',1],['E4',2],['B4',2]]},
 {id:11,stage:3,title:'Subiendo por el pentagrama',emoji:'🪜',desc:'Línea, espacio, línea, espacio…',bpm:90,ui:{score:true},
  lesson:'Las notas suben por el pentagrama como por una escalera: línea, espacio, línea, espacio… ¡Sigue hasta el Do agudo!',
  seq:[['E4',1],['F4',1],['G4',1],['A4',1],['B4',1],['C5',2],['B4',1],['A4',1],['G4',2]]},
 {id:12,stage:3,title:'Ritmos: negras y blancas',emoji:'⏱️',desc:'Cada figura dura un tiempo distinto.',bpm:90,ui:{score:true},
  lesson:'La negra (cabeza rellena ♩) dura 1 tiempo. La blanca (círculo abierto) dura 2: mantén la tecla más.',
  seq:[['G4',1],['A4',1],['B4',1],['C5',1],['B4',2],['G4',2],['E4',1],['F4',1],['G4',3]]},
 {id:13,stage:3,title:'El Do central',emoji:'🎯',desc:'La línea adicional.',bpm:90,ui:{score:true},
  lesson:'El Do central se escribe con una pequeña línea adicional debajo del pentagrama. ¡Ya puedes leer todas las notas del curso!',
  seq:[['C4',1],['D4',1],['E4',1],['F4',1],['G4',1],['A4',1],['B4',1],['C5',2],['G4',1],['E4',1],['C4',3]]},
 {id:14,stage:4,title:'La escala completa',emoji:'🎼',desc:'Do mayor subiendo una octava.',bpm:92,ui:{hand:true,handGuide:'hand_pov_thumb_under.jpg'},fing:[1,2,3,1,2,3,4,5],
  seq:[['C4',1],['D4',1],['E4',1],['F4',1],['G4',1],['A4',1],['B4',1],['C5',1]]},
 {id:15,stage:4,title:'Escala ida y vuelta',emoji:'🔄',desc:'Sube la octava y vuelve bajando.',bpm:96,ui:{hand:true},fing:[1,2,3,1,2,3,4,5,4,3,2,1,3,2,1],
  seq:[['C4',1],['D4',1],['E4',1],['F4',1],['G4',1],['A4',1],['B4',1],['C5',1],['B4',1],['A4',1],['G4',1],['F4',1],['E4',1],['D4',1],['C4',1]]},
 {id:16,stage:4,title:'Arpegios',emoji:'🏗️',desc:'Do mayor y Sol mayor, subiendo y bajando.',bpm:100,ui:{hand:true},fing:[1,2,3,5,3,2,1, 1,2,3,5,3,2,1],
  seq:[['C4',1],['E4',1],['G4',1],['C5',1],['G4',1],['E4',1],['C4',1],['G4',1],['B4',1],['D5',1],['G5',1],['D5',1],['B4',1],['G4',1]]},
 {id:17,stage:4,title:'Canción: Martinillo',emoji:'🔔',desc:'¡Tu primera canción completa!',bpm:104,song:true,ui:{hand:true,score:true},fing:FING_MART,seq:MARTINILLO},
 {id:18,stage:4,title:'Canción: Estrellita',emoji:'⭐',desc:'La canción de las estrellas, entera.',bpm:100,song:true,ui:{hand:true,score:true},fing:FING_EST,seq:ESTRELLITA},
 {id:19,stage:4,title:'Canción: Himno de la Alegría',emoji:'🎻',desc:'La melodía más famosa de Beethoven.',bpm:112,song:true,ui:{hand:true,score:true},fing:FING_HIM,seq:HIMNO},
 {id:20,stage:4,title:'Canción: Cumpleaños Feliz',emoji:'🎂',desc:'¡Para cantar en cualquier fiesta!',bpm:126,song:true,ui:{hand:true,score:true},fing:FING_CUM,seq:CUMPLE},
 {id:21,stage:4,title:'Canción: Noche de Paz',emoji:'🌙',desc:'Un clásico suave para cerrar la etapa.',bpm:96,song:true,ui:{hand:true,score:true},fing:FING_NOCHE,seq:NOCHE},
 {id:22,stage:5,title:'Hola, mano izquierda',emoji:'🫲',desc:'Las notas graves también se tocan.',bpm:80,ui:{hand:true,handGuide:'hand_pov_left_1to5.jpg'},handAll:'I',fing:[1,2,3,2,1],
  lesson:'La mano izquierda también numera sus dedos del 1 al 5. Su pulgar queda cerca del centro del piano.',
  seq:[['C3',1],['D3',1],['E3',1],['D3',1],['C3',1]]},
 {id:23,stage:5,title:'Los cinco graves',emoji:'🦶',desc:'Cinco notas de la mano izquierda.',bpm:85,ui:{hand:true,handGuide:'hand_pov_left_1to5.jpg'},handAll:'I',fing:[1,2,3,4,5,5,4,3,2,1],
  seq:[['C3',1],['D3',1],['E3',1],['F3',1],['G3',1],['G3',1],['F3',1],['E3',1],['D3',1],['C3',1]]},
 {id:24,stage:5,title:'Manos que se turnan',emoji:'🔁',desc:'Derecha e izquierda por turnos.',bpm:85,ui:{hand:true,handGuide:'hand_pov_two_hands.jpg'},hands:handsAlt(10,['D','I']),fing:[1,1,2,2,3,3,4,4,5,5],
  lesson:'Ahora participan las dos manos, ¡pero una a la vez! Mira la etiqueta de mano y el dibujo antes de cada nota.',
  seq:[['C4',1],['C3',1],['D4',1],['D3',1],['E4',1],['E3',1],['F4',1],['F3',1],['G4',1],['G3',1]]},
 {id:25,stage:5,title:'Escalera de octavas',emoji:'🪜',desc:'Sube alternando las dos manos.',bpm:90,ui:{hand:true,handGuide:'hand_pov_two_hands.jpg'},hands:handsAlt(16,['D','I']),
  fing:[1,1,2,1,3,1,1,1,2,1,3,1,4,1,5,1],
  seq:[['C4',1],['C3',1],['D4',1],['D3',1],['E4',1],['E3',1],['F4',1],['F3',1],['G4',1],['G3',1],['A4',1],['A3',1],['B4',1],['B3',1],['C5',1],['C4',1]]},
 {id:26,stage:5,title:'Ecos',emoji:'🗻',desc:'La derecha canta y la izquierda repite.',bpm:90,ui:{hand:true,handGuide:'hand_pov_two_hands.jpg'},
  hands:['D','D','D','I','I','I','D','D','D','I','I','I','D','D','D','I','I','I','D','I'],
  fing:[1,2,3,3,2,1,1,2,3,3,2,1,1,2,3,3,2,1,1,1],
  lesson:'La mano derecha toca un motivo y la izquierda lo responde una octava más grave, como un eco en la montaña.',
  seq:[['C4',1],['D4',1],['E4',1],['C3',1],['D3',1],['E3',1],['E4',1],['F4',1],['G4',1],['E3',1],['F3',1],['G3',1],
   ['G4',1],['F4',1],['E4',1],['G3',1],['F3',1],['E3',1],['C4',2],['C3',2]]},
 {id:27,stage:6,title:'Campanitas',emoji:'🛷',desc:'El villancico más famoso del mundo.',bpm:110,song:true,ui:{hand:true,score:true},fing:FING_CAMP,seq:CAMPANITAS,
  lesson:'¡Canción famosa desbloqueada! Lee la partitura y usa la digitación. Las redondas (círculo sin plica) duran 4 tiempos.'},
 {id:28,stage:6,title:'Cuando los santos',emoji:'🎺',desc:'El clásico del jazz tradicional.',bpm:108,song:true,ui:{hand:true,score:true},fing:FING_SAINTS,seq:SAINTS},
 {id:29,stage:6,title:'Greensleeves',emoji:'🏰',desc:'La balada inglesa legendaria.',bpm:92,song:true,ui:{hand:true,score:true},fing:FING_GREENS,seq:GREENS,
  lesson:'Una melodía de hace más de 400 años. Deja que las notas largas respiren.'},
 {id:30,stage:7,title:'Bajo y melodía',emoji:'🤲',desc:'La izquierda sostiene, la derecha canta.',bpm:90,ui:{hand:true},hands:H_BAJOMELO,
  lesson:'A dos manos de verdad: la izquierda toca el bajo y la derecha la melodía. Muy despacio al principio.',
  seq:BAJOMELO},
 {id:31,stage:7,title:'Vals sencillo',emoji:'💃',desc:'Bajo y dos notas, en ritmo de vals.',bpm:96,ui:{hand:true},hands:H_VALS,seq:VALS},
 {id:32,stage:7,title:'Noche de Paz a dos manos',emoji:'🌙',desc:'Con bajo incluido.',bpm:88,song:true,ui:{hand:true},hands:H_NOCHE2,seq:NOCHE2},
 {id:33,stage:7,title:'Himno a dos manos',emoji:'🎻',desc:'Beethoven con bajos.',bpm:104,song:true,ui:{hand:true},hands:H_HIMNO2,seq:HIMNO2},
 {id:34,stage:8,title:'Para Elisa',emoji:'🌹',desc:'El tema más famoso del piano… ¡con sostenidos!',bpm:100,song:true,ui:{hand:true,score:true},fing:FING_FUR,seq:FUR,
  lesson:'¡Llegaron las teclas negras! D# (Re#) y G# (Sol#) aparecen con el símbolo ♯. El trino inicial se toca con los dedos 3 y 2.'},
 {id:35,stage:8,title:'Minueto en Sol',emoji:'🎩',desc:'El elegante baile de Bach.',bpm:104,song:true,ui:{hand:true,score:true},fing:FING_MINUET,seq:MINUET},
 {id:36,stage:8,title:'Canon en Re',emoji:'🌊',desc:'La melodía más serena de Pachelbel.',bpm:88,song:true,ui:{hand:true,score:true},fing:FING_CANON,seq:CANON},
 {id:37,stage:9,title:'Campanitas a dos manos',emoji:'🛷',desc:'Versión de concierto con bajos.',bpm:104,song:true,ui:{hand:true},hands:H_CAMP2,seq:CAMP2},
 {id:38,stage:9,title:'Estrellita de concierto',emoji:'⭐',desc:'Lenta, expresiva y perfecta.',bpm:90,song:true,ui:{hand:true,score:true},fing:FING_EST,seq:ESTRELLITA,
  lesson:'Versión de concierto: más lenta y expresiva. Respira entre frases y mira la partitura.'},
 {id:39,stage:9,title:'Noche de Paz · Gran final',emoji:'🌙',desc:'A dos manos, como un profesional.',bpm:84,song:true,ui:{hand:true},hands:H_NOCHE2,seq:NOCHE2},
 {id:40,stage:9,title:'Popurrí de graduación',emoji:'🎓',desc:'Tu examen final: bajos + melodía + ¡confeti!',bpm:100,song:true,ui:{hand:true},hands:H_GRANFINAL,seq:GRANFINAL,
  lesson:'El gran final 🎓: un popurrí con las melodías que aprendiste, a dos manos. Cuando termines… ¡serás pianista graduado!'},
 {id:41,stage:9,title:'Bonus: Super Mario',emoji:'🍄',desc:'¡El clásico de Nintendo!',bpm:140,song:true,ui:{hand:true,score:true},fing:FING_SMARIO,seq:SMARIO},
 {id:42,stage:9,title:'Bonus: Harry Potter',emoji:'🧙‍♂️',desc:'Hedwig\'s Theme.',bpm:120,song:true,ui:{hand:true,score:true},fing:FING_HPOTTER,seq:HPOTTER},
 {id:43,stage:9,title:'Bonus: Baby Shark',emoji:'🦈',desc:'¡Doo doo doo doo doo doo!',bpm:110,song:true,ui:{hand:true,score:true},fing:FING_BSHARK,seq:BSHARK},
 {id:44,stage:9,title:'Bonus: Piratas',emoji:'🏴‍☠️',desc:'Piratas del Caribe.',bpm:130,song:true,ui:{hand:true,score:true},fing:FING_PIRATAS,seq:PIRATAS}
];
LEVELS.forEach(function(l){ l.notes=l.seq.map(function(x){return {midi:nameToMidi(x[0]),dur:x[1]};}); });

/* ============ RECOMPENSAS ============ */
function stageDoneIn(prog,s){
  var lv=LEVELS.filter(function(l){return l.stage===s;});
  return lv.length>0&&lv.every(function(l){return (prog[l.id]||0)>0;});
}

function courseStats(prog){
  var done=0, stars=0, threes=0;
  for(var i=0;i<LEVELS.length;i++){
    var s=prog[LEVELS[i].id]||0;
    if(s>0){ done++; stars+=s; if(s===3) threes++; }
  }
  return {done:done, stars:stars, threes:threes};
}

function getDailyStatsSafe(){
  try{
    var d=JSON.parse(localStorage.getItem('pf_daily'));
    if(d) return d;
  }catch(e){}
  return {streak:0};
}

function earnedBadges(prog){
  var st=courseStats(prog);
  var daily=getDailyStatsSafe();
  var out=[];
  BADGES.forEach(function(b){
    if(b.fn && b.fn(prog, st, daily)) out.push(b.id);
  });
  return out;
}

var BADGES=[
 {id:'first',icon:'🐣',name:'Primer paso',desc:'Completa tu primera lección',fn:function(p,s){return s.done>=1;}},
 {id:'five',icon:'🎵',name:'Aprendiz musical',desc:'Completa 5 niveles',fn:function(p,s){return s.done>=5;}},
 {id:'posture',icon:'🖐',name:'Dedos de oro',desc:'Domina Postura y técnica',fn:function(p){return stageDoneIn(p,2);}},
 {id:'reader',icon:'📖',name:'Lector de partituras',desc:'Completa Lectura musical',fn:function(p){return stageDoneIn(p,3);}},
 {id:'player',icon:'🚀',name:'Intérprete',desc:'Completa Melodías reales',fn:function(p){return stageDoneIn(p,4);}},
 {id:'left',icon:'🫲',name:'La mano misteriosa',desc:'Domina la mano izquierda',fn:function(p){return stageDoneIn(p,5);}},
 {id:'magic',icon:'✨',name:'Estrella en ascenso',desc:'Completa las Canciones mágicas',fn:function(p){return stageDoneIn(p,6);}},
 {id:'twohands',icon:'🤲',name:'Dos manos, un piano',desc:'Completa la etapa a dos manos',fn:function(p){return stageDoneIn(p,7);}},
 {id:'virtuoso',icon:'🔥',name:'Virtuoso',desc:'Supera los desafíos virtuosos',fn:function(p){return stageDoneIn(p,8);}},
 {id:'grad',icon:'🎓',name:'Pianista graduado',desc:'Completa todo el curso',fn:function(p){return stageDoneIn(p,9);}},
 {id:'stars30',icon:'⭐',name:'Coleccionista',desc:'Consigue 30 estrellas',fn:function(p,s){return s.stars>=30;}},
 {id:'diamond',icon:'💎',name:'Perfeccionista',desc:'Logra 3 estrellas en 10 niveles',fn:function(p,s){return s.threes>=10;}},
 {id:'streak3',icon:'🥉',name:'Llama de bronce',desc:'Racha de 3 días seguidos',fn:function(p,s,d){return d.streak>=3;}},
 {id:'streak7',icon:'🥈',name:'Llama de plata',desc:'Racha de 7 días seguidos',fn:function(p,s,d){return d.streak>=7;}},
 {id:'streak30',icon:'🥇',name:'Llama de oro',desc:'Racha de 30 días seguidos',fn:function(p,s,d){return d.streak>=30;}}
];

