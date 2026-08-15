# 🎹 MEMORIA DEL PROYECTO — PianoFácil PRO para Mateo

> Archivo de Memoria Viva del Proyecto. Actualizado al 2026-08-13 (Versión 3.0 PRO - GeoGuessr Avatar & Audio Studio). Leer esto antes de retomar cualquier tarea del proyecto.

---

## 📋 RESUMEN EJECUTIVO

**PianoFácil PRO para Mateo** es una Progressive Web App (PWA) y aplicación nativa Android de aprendizaje de piano con diseño de nivel profesional (**"Apple Arcade / Simply Piano PRO"**), diseñada para que **Mateo** (hijo de Sebastián Cortés) aprenda piano de forma gamificada, con avatar interactivo animado estilo **GeoGuessr / Duolingo**, teclado virtual 3D táctil en pantalla, osciloscopio en tiempo real y detección de notas por micrófono desde su piano acústico real.

- **Repositorio GitHub:** <https://github.com/SebastianCortesIbacache/Easy-Piano>
- **GitHub Pages (web):** <https://sebastiancortesibacache.github.io/Easy-Piano/>
- **APK Android local:** `e:\Easy Piano\PianoFacil-Mateo.apk` (4.57 MB)
- **Cuenta GitHub:** `SebastianCortesIbacache`

---

## 📂 ESTRUCTURA DE ARCHIVOS

```text
e:\Easy Piano\
├── index.html              ← App HTML semántico con header gamer, avatar y osciloscopio (~280 líneas)
├── app.js                  ← Lógica core, motor Web Audio HI-FI, motor de Avatar SVG, osciloscopio y Synthesia (~1750 líneas)
├── levels.js               ← Base de datos de 44 niveles, canciones, 9 etapas, tips familiares y recompensas (~310 líneas)
├── styles.css              ← Sistema de diseño PRO completo: dark glassmorphism, avatar animado, teclado 3D de marfil/ébano, fieltro acústico (~1950 líneas)
├── manifest.webmanifest    ← Metadatos PWA (nombre, iconos, colores)
├── sw.js                   ← Service Worker (modo offline, cache-first)
├── icon-192.png            ← Ícono PWA 192×192
├── icon-512.png            ← Ícono PWA 512×512
├── package.json            ← Dependencias: @capacitor/core, @capacitor/android, @capacitor/cli
├── package-lock.json       ← Lock de dependencias npm
├── capacitor.config.json   ← Config Capacitor: appId=com.pianofacil.mateo
├── README.md               ← Documentación del proyecto
├── .gitignore              ← Excluye: node_modules/, android/, www/, *.apk
├── PROYECTO_MEMORIA.md     ← Este archivo de memoria viva del proyecto
│
├── node_modules/           ← [IGNORADO EN GIT] paquetes npm instalados
├── www/                    ← [IGNORADO EN GIT] copia web sincronizada para Capacitor
└── android/                ← [IGNORADO EN GIT] proyecto nativo Android generado por Capacitor
    └── app/
        ├── src/main/
        │   ├── AndroidManifest.xml   ← Permisos: INTERNET, RECORD_AUDIO, MODIFY_AUDIO_SETTINGS
        │   └── assets/public/        ← Copia de www/ embebida en la APK
        └── build/outputs/apk/debug/
            └── app-debug.apk         ← APK compilada (copiada a la raíz como PianoFacil-Mateo.apk)
```

---

## 🛠️ STACK TECNOLÓGICO

| Componente | Tecnología | Versión / Detalle |
| --- | --- | --- |
| Frontend | HTML5 + CSS Vanilla + JavaScript ES6 Modular | Separado en `app.js`, `levels.js`, `styles.css` |
| Avatar Dinámico | Generador SVG multi-capa + CSS Keyframes | Estilo GeoGuessr/Duolingo 3D, expresiones reactivas y accesorios por etapa |
| Síntesis de audio | Web Audio API (6 armónicos + Dynamics Compressor) | ADSR envelope, modelado físico acústico, micro-sonidos UI |
| Detección de pitch | Autocorrelación + BiquadFilter LP 1400Hz | Detección continua optimizada para piano acústico físico |
| Visualizador en Vivo | HTML5 Canvas 2D + Web Audio AnalyserNode | Osciloscopio neón dual (Virtual + Mic) y Synthesia neón |
| QA & Testing | Playwright (E2E Automated Testing) | Suite en Node.js y pruebas automatizadas en browser |
| Fuentes | Outfit (Google Fonts / fontsource CDN) | 400, 600, 700, 800, 900 |
| PWA | Service Worker + manifest.webmanifest | Cache-first, offline completo |
| Empaquetado Android | Capacitor 7 | `@capacitor/android` ^7.0.0 |
| Java (compilación) | Microsoft OpenJDK 21 | `C:\Program Files\Microsoft\jdk-21.0.12.8-hotspot` |
| Android SDK | SDK local | `C:\Users\Wusch\AppData\Local\Android\Sdk` |
| Build system | Gradle 8.11.1 | Auto-descargado por Gradle Wrapper |
| Node.js | v24.15.0 | `C:\Program Files\nodejs\` |

---

## 🎮 FUNCIONALIDADES IMPLEMENTADAS EN VERSIÓN 3.0 PRO

### 1. 👦 Avatar Interactivo de Mateo (Estilo GeoGuessr / Duolingo 3D)
- **Diseño Vectorial Expresivo:** Rostro animado en SVG + CSS puro (ojos con parpadeo dinámico, mejillas sonrosadas y boca reactiva).
- **Estados Emocionales en Vivo:**
  - `idle`: Respiración suave y parpadeo natural.
  - `listen`: Audífonos neón y cabeceo al ritmo de la audición.
  - `playing`: Postura de concentración y manos listas.
  - `happy`: Salto alegre y ojos brillantes `^ ^` al acertar notas.
  - `fire`: Modo Super Saiyan con aura de fuego llameante, gafas oscuras de estrella de rock y gesto `🤘` en racha de 5+ notas.
  - `oops`: Gesto comprensivo de ánimo con pulgar arriba `👍` y gota de sudor al fallar.
  - `victory`: Salto de victoria sosteniendo el trofeo de oro `🏆` y confeti.
- **Accesorios Progresivos según la Etapa:**
  - *Etapas 1-2:* Gorra deportiva de aprendiz 🌱.
  - *Etapas 3-5:* Audífonos de estudio gamer neón con LEDs pulsantes 🎧.
  - *Etapas 6-8:* Corbatín de concertista y estrellas brillantes ✨.
  - *Etapa 9:* Capa real púrpura y Corona Dorada de Gran Maestro 👑.
- **Globo de Diálogo Dinámico:** Consejos pedagógicos y frases familiares personalizadas (Mateo, Seba, Fer, Bernardita).
- **Interacción por Click / Toque:** Al tocar el avatar en el header o en la barra de compañero, Mateo reproduce un sonido amigable y comparte un consejo musical aleatorio.

### 2. 🎹 Teclado 3D Táctil Ultra-Realista
- **Teclas Blancas:** Acabado marfil multicapa con bisel 3D, reflejos superiores y desplazamiento táctil (`translateY(6px)`).
- **Teclas Negras:** Ébano satinado con bisel de luz cenital.
- **Fieltro:** Rojo carmesí profundo con textura de paño de piano de gran cola.
- **Feedback:** Efecto ripple divergente y lluvia de partículas arcade (`🎵`, `✨`, `⭐`, `🎹`).

### 3. 🗺️ Mapa de Aprendizaje Gamificado (9 Etapas & 44 Niveles)
- Nodos 3D interactivos con estados (`done` esmeralda, `current` oro con pulso neón, `locked` atenuado).
- Tarjeta de perfil de Mateo en header con avatar interactivo, racha viva (`🔥`), contador de estrellas (`⭐`) y minutos practicados (`⏱`).

### 4. 🎙️ Estudio Libre con Osciloscopio & Afinador en Tiempo Real
- Visualizador de ondas de audio sobre Canvas en tiempo real para sintetizador y micrófono.
- VU meter analógico y detector de frecuencia en Hz con afinación centesimal.

### 5. 🎼 HUD Arcade de Práctica & Synthesia Neón
- Notas cayendo con estelas de velocidad y esquinas redondeadas.
- Clave de Sol estilizada con cursor de pentagrama en vivo.
- Manos anatómicas vectoriales con iluminación en los dedos activos.
- Modo paciente 🐢 y selector de tempo.

---

## 🔨 COMANDOS PARA RETOMAR EL PROYECTO

### Servir localmente (modo web)
```powershell
cd "e:\Easy Piano"
python -m http.server 8080
# Abrir: http://localhost:8080
```

### Sincronizar y Reconstruir la APK Android
```powershell
# 1. Copiar activos a www/
cd "e:\Easy Piano"
Copy-Item index.html www\ -Force
Copy-Item styles.css www\ -Force
Copy-Item app.js www\ -Force
Copy-Item levels.js www\ -Force
Copy-Item manifest.webmanifest www\ -Force
Copy-Item sw.js www\ -Force
Copy-Item icon-192.png www\ -Force
Copy-Item icon-512.png www\ -Force

# 2. Sincronizar con Capacitor Android
node ./node_modules/@capacitor/cli/bin/capacitor sync android

# 3. Compilar APK Debug
$env:JAVA_HOME="C:\Program Files\Microsoft\jdk-21.0.12.8-hotspot"
$env:ANDROID_HOME="$env:LOCALAPPDATA\Android\Sdk"
$env:Path="$env:JAVA_HOME\bin;$env:Path"
Set-Location "e:\Easy Piano\android"
.\gradlew.bat assembleDebug

# 4. Copiar APK a la raíz del proyecto
Copy-Item "e:\Easy Piano\android\app\build\outputs\apk\debug\app-debug.apk" `
          "e:\Easy Piano\PianoFacil-Mateo.apk" -Force
```

---

## 👨‍👩‍👦 CONTEXTO FAMILIAR

| Persona | Rol en la app |
| --- | --- |
| **Mateo** | El alumno estrella — destinatario principal de la app |
| **Seba (Sebastián)** | El papá — desarrolló el proyecto con amor |
| **Fer** | La hermana de Mateo |
| **Bernardita** | La mamá |

---

## 📊 ESTADO ACTUAL (2026-08-14)

- ✅ **Avatar 3D Chibi de Mateo Estilo GeoGuessr implementado:**
  - Modelado a partir de la foto real de Mateo y la referencia 3D blind box / GeoGuessr.
  - Vestimenta de verano: polera roja, shorts grises y zapatillas blancas con rojo.
  - Modelo 3D GLTF/GLB real cargado en Three.js con soporte PBR y sombras: [mateo.glb](file:///e:/Easy%20Piano/mateo.glb).
  - Retrato PNG transparente para Modo Niño: [mateo_chibi_portrait.png](file:///e:/Easy%20Piano/mateo_chibi_portrait.png).
- ✅ **Guías Educativas de Postura de Manos (hand_image_prompts.md):**
  - Generadas en 3D educativo semi-realista con fondo transparente y guardadas en `assets/hand_guides/` y `www/assets/hand_guides/`:
    - `hand_finger_1_to_5_right.png` (y `-portrait.png`) — Mano derecha con numeración 1 a 5 sobre teclas C-G.
    - `hand_finger_1_to_5_left.png` (y `-portrait.png`) — Mano izquierda con numeración 5 a 1 sobre teclas C-G.
    - `hand_posture_thumb_under.png` (y `-portrait.png`) — Técnica de paso de pulgar por debajo.
    - `hand_relaxed_wrist_side.png` (y `-portrait.png`) — Postura neutra y relajada de muñeca con check verde.
    - `hand_two_hands_small_span.png` (y `-portrait.png`) — Posición de ambas manos juntas en rango C.
    - `hand_curve_tip_contact.png` (y `-portrait.png`) — Curvatura de dedos y apoyo de yemas con esfera guía.
    - `hand_thumb_below.png` (y `-portrait.png`) — Contacto lateral del pulgar.
- ✅ **Auditoría Multi-Agente & Correcciones Aplicadas:**
  - Desanidamiento y reparación estructural de modales en `index.html`.
  - Estilos CSS completos para Modo Niño, Neón Hints, Onboarding y Retratos en `styles.css`.
  - Caché Service Worker offline `v3` actualizada con todos los scripts y assets en `sw.js`.
  - Desbloqueo universal de AudioContext para dispositivos táctiles en `app.js`.
- ✅ **APK Android Nativa Compilada:** [PianoFacil-Mateo.apk](file:///e:/Easy%20Piano/PianoFacil-Mateo.apk) (23.38 MB, construida exitosamente con Gradle y Microsoft OpenJDK 21, incluye todos los assets 3D y guías de manos embebidas para funcionamiento 100% offline).
