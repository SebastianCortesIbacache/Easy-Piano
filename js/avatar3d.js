/* ==========================================================================
   PIANOFÁCIL PRO · MÓDULO 5: MOTOR 3D THREE.JS, AVATAR & RETRATO OFICIAL
   Diseñado para Mateo · js/avatar3d.js
   ========================================================================== */

var currentAvatarState = 'idle';
var avatarResetTimer = null;

var mateo3d = {
  scene: null,
  camera: null,
  renderer: null,
  model: null,
  mixer: null,
  clock: null,
  loaded: false,
  state: 'idle',
  targetRotationY: 0,
  baseY: 0,
  jumpOffset: 0,
  isDragging: false,
  prevMouseX: 0
};

function updateMateo3DState(state){
  if(typeof mateo3d === 'undefined' || !mateo3d) return;
  mateo3d.state = state;

  var fbImg = document.getElementById('fallbackPortraitImg');
  if(fbImg && (state === 'happy' || state === 'victory')){
    fbImg.classList.remove('av-bounce');
    void fbImg.offsetWidth;
    fbImg.classList.add('av-bounce');
  }

  if(!mateo3d.model) return;

  if(state === 'happy'){
    mateo3d.jumpOffset = 0.25;
  } else if(state === 'victory'){
    mateo3d.jumpOffset = 0.45;
  } else if(state === 'oops'){
    mateo3d.model.rotation.z = 0.15;
    setTimeout(function(){ if(mateo3d && mateo3d.model) mateo3d.model.rotation.z = 0; }, 400);
  }
}

function setAvatarState(state, speechMsg, resetDelayMs){
  currentAvatarState = state || 'idle';

  var portraitImgHtml = '<img src="mateo_chibi_portrait.png" class="companionPortrait" alt="Mateo">';

  // 1. Renderizar en Header
  var hSvg = document.getElementById('headerAvatarSvg');
  if(hSvg) hSvg.innerHTML = portraitImgHtml;
  var hBtn = document.getElementById('headerAvatarBtn');
  if(hBtn){
    hBtn.className = 'avatarHeaderBtn' + (currentAvatarState === 'fire' ? ' av-state-fire' : '');
  }

  // 2. Renderizar en Companion Bar
  var cSvg = document.getElementById('companionAvatarSvg');
  if(cSvg){
    cSvg.innerHTML = portraitImgHtml;
  }
  var cBar = document.getElementById('companionBar');
  if(cBar){
    cBar.className = 'companionBar' + (currentAvatarState === 'fire' ? ' av-state-fire' : '');
  }

  // 3. Renderizar en Modal de Victoria
  var mSvg = document.getElementById('modalAvatarSvg');
  if(mSvg){
    mSvg.innerHTML = '<img src="mateo_chibi_portrait.png" class="modalPortraitImg" alt="Mateo Campeón">';
  }

  // 4. Sincronizar Widget Flotante 3D Permanente
  var fw = document.getElementById('floatingMateoWidget');
  if(fw){
    fw.className = 'floatingWidget fw-state-' + currentAvatarState;
  }
  updateMateo3DState(currentAvatarState);

  var emotionMap = {
    'idle': '✨ Flotando',
    'listen': '🎧 Escuchando',
    'playing': '🎹 Concentrado',
    'happy': '🌟 ¡Excelente!',
    'fire': '🔥 ¡En llamas!',
    'oops': '💪 ¡Tú puedes!',
    'victory': '🏆 ¡Campeón!'
  };

  var emTag = document.getElementById('floatingEmotionTag');
  if(emTag) emTag.textContent = emotionMap[currentAvatarState] || '✨ Listo';

  // 5. Actualizar Diálogos
  if(speechMsg){
    var spTxt = document.getElementById('speechTxt');
    if(spTxt) spTxt.textContent = speechMsg;
    var spBox = document.getElementById('avatarSpeech');
    if(spBox){
      spBox.classList.remove('speechPop');
      void spBox.offsetWidth;
      spBox.classList.add('speechPop');
    }

    var flTxt = document.getElementById('floatingSpeechTxt');
    if(flTxt) flTxt.textContent = speechMsg;
    var flBubble = document.getElementById('floatingSpeechBubble');
    if(flBubble){
      flBubble.classList.remove('speechPop');
      void flBubble.offsetWidth;
      flBubble.classList.add('speechPop');
    }
  }

  clearTimeout(avatarResetTimer);
  if(resetDelayMs && resetDelayMs > 0){
    avatarResetTimer = setTimeout(function(){
      if(typeof practice !== 'undefined' && practice && practice.active){
        setAvatarState(practice.intro ? 'listen' : (practice.streak >= 7 ? 'fire' : 'playing'), null, 0);
      } else {
        setAvatarState('idle', null, 0);
      }
    }, resetDelayMs);
  }
}

var isFloatingSpeechBubbleOpen = true;

function toggleFloatingSpeechBubble(forceState){
  var flBubble = document.getElementById('floatingSpeechBubble');
  var btn = document.getElementById('avatarInteractBtn');
  if(!flBubble) return;

  if(typeof forceState === 'boolean'){
    isFloatingSpeechBubbleOpen = forceState;
  } else {
    isFloatingSpeechBubbleOpen = !isFloatingSpeechBubbleOpen;
  }

  if(isFloatingSpeechBubbleOpen){
    flBubble.classList.remove('bubble-closed');
    if(btn){
      btn.classList.remove('is-closed');
      btn.title = 'Ocultar mensaje de Mateo';
      btn.setAttribute('aria-label', 'Ocultar mensaje');
    }
  } else {
    flBubble.classList.add('bubble-closed');
    if(btn){
      btn.classList.add('is-closed');
      btn.title = 'Mostrar mensaje de Mateo';
      btn.setAttribute('aria-label', 'Mostrar mensaje');
    }
  }
}

function triggerAvatarGreeting(){
  if(typeof playUiSound === 'function') playUiSound('click');
  toggleFloatingSpeechBubble(true); // Abrir la nube si estaba cerrada
  var tips = (typeof AVATAR_TIPS !== 'undefined' && AVATAR_TIPS.length) ? AVATAR_TIPS : ((typeof MATEO_AVATAR_TIPS !== 'undefined' && MATEO_AVATAR_TIPS.length) ? MATEO_AVATAR_TIPS : ['¡Hola! A tocar con ritmo 🎵']);
  var tip = tips[Math.floor(Math.random() * tips.length)];
  setAvatarState('happy', tip, 5500);
  if(typeof toast === 'function') toast('🌟 Guía: ' + tip);
}
var triggerMateoAvatarGreeting = triggerAvatarGreeting;

/* ============ MOTOR 3D THREE.JS: AVATAR GLB DE MATEO ============ */
function initMateo3D(){
  var canvas = document.getElementById('avatarCanvas');
  var stage = document.getElementById('avatar3dStage');
  if(!canvas || !stage || typeof THREE === 'undefined') return;

  var width = stage.clientWidth || 170;
  var height = stage.clientHeight || 260;

  mateo3d.clock = new THREE.Clock();
  mateo3d.scene = new THREE.Scene();

  mateo3d.camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
  mateo3d.camera.position.set(0, 0.35, 2.85);

  var hasWebGL = false;
  try {
    var testCtx = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    hasWebGL = !!(testCtx && testCtx.getExtension);
  } catch(e) { hasWebGL = false; }

  if (!hasWebGL) {
    console.warn('WebGL is not supported in current environment. 3D avatar fallback enabled.');
    return;
  }

  try {
    mateo3d.renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  } catch(e) {
    console.warn('WebGL initialization notice (non-fatal):', e.message);
    return;
  }
  mateo3d.renderer.setSize(width, height);
  mateo3d.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  mateo3d.renderer.shadowMap.enabled = true;
  if(THREE.PCFSoftShadowMap) mateo3d.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  mateo3d.renderer.physicallyCorrectLights = true;
  if(THREE.sRGBEncoding) mateo3d.renderer.outputEncoding = THREE.sRGBEncoding;
  else if(THREE.SRGBColorSpace) mateo3d.renderer.outputColorSpace = THREE.SRGBColorSpace;
  if(THREE.ACESFilmicToneMapping) {
    mateo3d.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    mateo3d.renderer.toneMappingExposure = 1.25;
  }

  // Luces de estudio locales de alto contraste
  var hemiLight = new THREE.HemisphereLight(0xffffff, 0x333355, 1.4);
  hemiLight.position.set(0, 10, 0);
  mateo3d.scene.add(hemiLight);

  var dirLight = new THREE.DirectionalLight(0xfff5e6, 2.0);
  dirLight.position.set(2.5, 4, 3);
  mateo3d.scene.add(dirLight);

  var rimLight = new THREE.DirectionalLight(0x8b6cff, 1.6);
  rimLight.position.set(-2.5, 2, -2.5);
  mateo3d.scene.add(rimLight);

  var goldAccent = new THREE.PointLight(0xffb547, 1.4, 6);
  goldAccent.position.set(0, -0.8, 1.8);
  mateo3d.scene.add(goldAccent);

  // Pedestal receptor de sombra
  var pedestal = new THREE.Mesh(
    new THREE.CircleGeometry(1.1, 48),
    new THREE.ShadowMaterial({ opacity: 0.45 })
  );
  pedestal.rotation.x = -Math.PI / 2;
  pedestal.position.y = -0.22;
  pedestal.receiveShadow = true;
  mateo3d.scene.add(pedestal);

  // Cargar GLB local del Avatar
  var fallback = document.getElementById('geo3dFallback');
  var hint = document.getElementById('avatarLoadingHint');

  // El fallback (planeta + retrato animado) SIEMPRE permanece visible por defecto
  if(fallback) fallback.style.display = 'block';
  if(canvas) canvas.style.display = 'none';

  // Si se abre vía protocolo local file://, los navegadores bloquean peticiones fetch/XHR por CORS.
  // En ese caso, el avatar fallback 2D activo y animado toma el control de inmediato sin errores.
  var isLocalFile = (typeof window !== 'undefined' && window.location && window.location.protocol === 'file:');
  if(isLocalFile){
    if(hint) hint.hidden = true;
    return;
  }

  if(typeof THREE.GLTFLoader !== 'undefined'){
    if(hint) hint.hidden = false;

    var loader = new THREE.GLTFLoader();
    var candidatePaths = ['mateo.glb', './mateo.glb', 'www/mateo.glb'];
    var tried = [];
    var modelLoadedSuccessfully = false;

    // Timeout de seguridad: si en 5 segundos no descarga o se bloquea, ocultar hint y mantener avatar 2D
    var loadTimeout = setTimeout(function(){
      if(!modelLoadedSuccessfully && hint){
        hint.hidden = true;
        if(fallback) fallback.style.display = 'block';
        if(canvas) canvas.style.display = 'none';
      }
    }, 5000);

    function tryLoadPath(idx){
      if(idx >= candidatePaths.length){
        clearTimeout(loadTimeout);
        if(hint) hint.hidden = true;
        if(fallback) fallback.style.display = 'block';
        if(canvas) canvas.style.display = 'none';
        return;
      }
      var path = candidatePaths[idx];
      tried.push(path);
      loader.load(path,
        function(gltf){
          clearTimeout(loadTimeout);
          modelLoadedSuccessfully = true;
          var model = gltf.scene;
          model.traverse(function(child){
            if(child.isMesh){
              child.castShadow = true;
              child.receiveShadow = true;
              if(child.material){
                child.material.roughness = Math.min(child.material.roughness || 0.6, 0.85);
                child.material.metalness = Math.min(child.material.metalness || 0.05, 0.2);
                if(child.material.map) child.material.map.encoding = THREE.sRGBEncoding;
                if(child.material.emissiveMap) child.material.emissiveMap.encoding = THREE.sRGBEncoding;
                child.material.envMapIntensity = child.material.envMapIntensity || 0.9;
                child.material.needsUpdate = true;
              }
              child.frustumCulled = true;
            }
          });

          var box = new THREE.Box3().setFromObject(model);
          var size = box.getSize(new THREE.Vector3());
          var center = box.getCenter(new THREE.Vector3());

          var maxDim = Math.max(size.x, size.y, size.z);
          var scale = 1.95 / (maxDim || 1);
          model.scale.setScalar(scale);

          model.position.x = -center.x * scale;
          model.position.y = -center.y * scale - 0.18;
          model.position.z = -center.z * scale;

          mateo3d.baseY = model.position.y;
          mateo3d.model = model;
          mateo3d.scene.add(model);
          mateo3d.loaded = true;

          // Solo ahora que el modelo 3D está listo, mostramos canvas y ocultamos fallback y hint
          if(hint) hint.hidden = true;
          if(canvas) canvas.style.display = 'block';
          if(fallback) fallback.style.display = 'none';

          if(gltf.animations && gltf.animations.length > 0){
            mateo3d.mixer = new THREE.AnimationMixer(model);
            var action = mateo3d.mixer.clipAction(gltf.animations[0]);
            action.play();
          }
        },
        function(xhr){
          if(xhr.lengthComputable && hint){
            var pct = Math.round((xhr.loaded / xhr.total) * 100);
            var span = hint.querySelector('span');
            if(span) span.textContent = 'Cargando Avatar 3D (' + pct + '%)...';
          }
        },
        function(err){
          tryLoadPath(idx + 1);
        }
      );
    }

    tryLoadPath(0);
  }

  dirLight.castShadow = true;
  var shadowSize = 1024;
  try{ if(navigator.deviceMemory && navigator.deviceMemory < 4) shadowSize = 512; }catch(e){}
  dirLight.shadow.mapSize.width = shadowSize;
  dirLight.shadow.mapSize.height = shadowSize;
  dirLight.shadow.camera.left = -2;
  dirLight.shadow.camera.right = 2;
  dirLight.shadow.camera.top = 2;
  dirLight.shadow.camera.bottom = -2;

  function onMateoResize(){
    if(!mateo3d.camera || !mateo3d.renderer || !stage) return;
    var w = stage.clientWidth || 170;
    var h = stage.clientHeight || 260;
    if(h > 0){
      mateo3d.camera.aspect = w / h;
      mateo3d.camera.updateProjectionMatrix();
      mateo3d.renderer.setSize(w, h);
      mateo3d.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    }
  }
  window.addEventListener('resize', onMateoResize);

  // Gestos táctiles / ratón para rotar el modelo 3D
  var dragStartX = 0, dragStartY = 0;
  stage.addEventListener('mousedown', function(e){
    mateo3d.isDragging = true;
    mateo3d.hasDragged = false;
    mateo3d.prevMouseX = e.clientX;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
  });
  window.addEventListener('mousemove', function(e){
    if(mateo3d.isDragging && mateo3d.model){
      var delta = e.clientX - mateo3d.prevMouseX;
      if(Math.abs(e.clientX - dragStartX) > 6 || Math.abs(e.clientY - dragStartY) > 6){
        mateo3d.hasDragged = true;
      }
      mateo3d.targetRotationY += delta * 0.015;
      mateo3d.prevMouseX = e.clientX;
    }
  });
  window.addEventListener('mouseup', function(){
    mateo3d.isDragging = false;
    setTimeout(function(){ if(mateo3d) mateo3d.hasDragged = false; }, 80);
  });

  stage.addEventListener('touchstart', function(e){
    if(e.touches.length === 1){
      mateo3d.isDragging = true;
      mateo3d.hasDragged = false;
      mateo3d.prevMouseX = e.touches[0].clientX;
      dragStartX = e.touches[0].clientX;
      dragStartY = e.touches[0].clientY;
    }
  }, { passive: true });
  window.addEventListener('touchmove', function(e){
    if(mateo3d.isDragging && mateo3d.model && e.touches.length === 1){
      var delta = e.touches[0].clientX - mateo3d.prevMouseX;
      if(Math.abs(e.touches[0].clientX - dragStartX) > 6 || Math.abs(e.touches[0].clientY - dragStartY) > 6){
        mateo3d.hasDragged = true;
      }
      mateo3d.targetRotationY += delta * 0.015;
      mateo3d.prevMouseX = e.touches[0].clientX;
    }
  }, { passive: true });
  window.addEventListener('touchend', function(){
    mateo3d.isDragging = false;
    setTimeout(function(){ if(mateo3d) mateo3d.hasDragged = false; }, 80);
  });

  // OrbitControls
  try{
    if(typeof THREE.OrbitControls !== 'undefined'){
      mateo3d.controls = new THREE.OrbitControls(mateo3d.camera, mateo3d.renderer.domElement);
      mateo3d.controls.enablePan = false;
      mateo3d.controls.enableDamping = true;
      mateo3d.controls.dampingFactor = 0.08;
      mateo3d.controls.minDistance = 1.4;
      mateo3d.controls.maxDistance = 6;
      mateo3d.controls.enableZoom = false;
      mateo3d.controls.maxPolarAngle = Math.PI * 0.6;
    }
  }catch(e){}

  function animate(){
    requestAnimationFrame(animate);
    if(document.hidden) return;
    if(!stage || stage.offsetParent === null) return;

    var delta = mateo3d.clock.getDelta();
    var time = mateo3d.clock.getElapsedTime();

    if(mateo3d.mixer) mateo3d.mixer.update(delta);
    if(mateo3d.controls) mateo3d.controls.update();

    if(mateo3d.model){
      var floatOffset = Math.sin(time * 2.2) * 0.04;
      mateo3d.model.position.y = mateo3d.baseY + floatOffset + mateo3d.jumpOffset;

      if(!mateo3d.isDragging){
        if(mateo3d.state === 'fire'){
          mateo3d.targetRotationY += delta * 2.6;
        } else if(mateo3d.state === 'victory'){
          mateo3d.targetRotationY += delta * 3.6;
        } else {
          mateo3d.targetRotationY = Math.sin(time * 0.8) * 0.25;
        }
      }
      mateo3d.model.rotation.y += (mateo3d.targetRotationY - mateo3d.model.rotation.y) * 0.1;

      if(mateo3d.jumpOffset > 0){
        mateo3d.jumpOffset = Math.max(0, mateo3d.jumpOffset - delta * 1.5);
      }
    }

    mateo3d.renderer.render(mateo3d.scene, mateo3d.camera);
  }
  animate();
}

try { initMateo3D(); } catch(e){ console.warn('ThreeJS 3D init:', e); }
