/* ============================================================
   Service Worker (PWA offline support) - PianoFácil PRO
============================================================= */
var CACHE = 'pianofacil-pro-v13';
var CORE = [
  './',
  './index.html',
  './styles.css',
  './levels.js',
  './js/state.js',
  './js/audio.js',
  './js/pitch.js',
  './js/midi.js',
  './js/piano.js',
  './js/avatar3d.js',
  './js/synthesia.js',
  './js/practice.js',
  './js/main.js',
  './assets/vendor/three.min.js',
  './assets/vendor/GLTFLoader.js',
  './assets/vendor/DRACOLoader.js',
  './assets/vendor/OrbitControls.js',
  './assets/vendor/RGBELoader.js',
  './assets/hand_guides/hand_curve_tip_contact.png',
  './assets/hand_guides/hand_finger_1_to_5_left.png',
  './assets/hand_guides/hand_finger_1_to_5_right.png',
  './assets/hand_guides/hand_posture_thumb_under.png',
  './assets/hand_guides/hand_pov_dome_claw.jpg',
  './assets/hand_guides/hand_pov_finger_independence.jpg',
  './assets/hand_guides/hand_pov_left_1to5.jpg',
  './assets/hand_guides/hand_pov_relaxed_wrist.jpg',
  './assets/hand_guides/hand_pov_right_1to5.jpg',
  './assets/hand_guides/hand_pov_thumb_under.jpg',
  './assets/hand_guides/hand_pov_two_hands.jpg',
  './assets/hand_guides/hand_relaxed_wrist_side.png',
  './assets/hand_guides/hand_thumb_below.png',
  './assets/hand_guides/hand_two_hands_small_span.png',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './mateo.glb',
  './mateo_chibi_portrait.png',
  './piano_hand_posture_1786427260354.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      return c.addAll(CORE);
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (k) { return k !== CACHE; })
            .map(function (k) { return caches.delete(k); })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  e.respondWith(
    fetch(req).then(function (res) {
      if (res && (res.ok || res.type === 'opaque')) {
        try{
          var parsed = new URL(req.url);
          if(parsed.protocol && (parsed.protocol === 'http:' || parsed.protocol === 'https:')){
            var copy = res.clone();
            caches.open(CACHE).then(function (c) {
              try{ c.put(req, copy); }catch(cacheErr){}
            });
          }
        }catch(e){}
      }
      return res;
    }).catch(function () {
      return caches.match(req).then(function (hit) {
        if (hit) return hit;
        if (req.mode === 'navigate') return caches.match('./index.html');
      });
    })
  );
});
