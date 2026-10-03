# 🎹 MEMORIA DEL PROYECTO — PianoFácil PRO (Versión 2.0 en Progreso)

> **Archivo de Memoria Viva del Proyecto Unificado.**
> Última Actualización: Octubre 2026 (Unificación de Carpetas en `E:\Easy Piano`, Generalización a Usuario Universal y Plan V2.0).
> Leer este documento antes de retomar cualquier tarea.

---

## 📋 1. RESUMEN EJECUTIVO

**PianoFácil PRO** es una Progressive Web App (PWA) y aplicación nativa Android de aprendizaje de piano con diseño de nivel profesional (**"Apple Arcade / Simply Piano PRO"**), diseñada para que **niños, niñas y estudiantes principiantes** aprendan piano acústico real o teclado digital de forma gamificada, interactiva y sin frustración.

- **Directorio Raíz Unificado:** `E:\Easy Piano` (Consolida la gobernanza de `E:\APP Piano` y el prototipo Godot).
- **Repositorio GitHub:** <https://github.com/SebastianCortesIbacache/Easy-Piano>
- **GitHub Pages (web):** <https://sebastiancortesibacache.github.io/Easy-Piano/>
- **APK Android compilada:** `PianoFacil-Mateo.apk` / `PianoFacil-PRO.apk` (~59.6 MB)
- **Cuenta GitHub:** `SebastianCortesIbacache`

---

## 🎯 2. DECISIONES CLAVE Y ACUERDOS RECIENTES

1. **Unificación de Carpetas:**
   - La raíz oficial y única de desarrollo es **`E:\Easy Piano`**.
   - Las reglas de agentes especializadas (`rules/` y `.agents/rules/`) han sido completamente sincronizadas y modernizadas.
2. **Generalización de Textos (Usuario Universal):**
   - La aplicación dejó de estar dirigida exclusivamente a una persona en particular para convertirse en una herramienta pedagógica universal para **cualquier niño o niña** ("¡Pequeño artista!", "¡Futuro maestro!", "¡Gran pianista!").
   - Todas las referencias familiares han sido transformadas en frases universales de apoyo familiar y amistad ("Tu familia y amigos estarán muy orgullosos", "¡Todos van a aplaudir de pie!").
   - El avatar actúa como el **Compañero Musical / Guía 3D**.
3. **Doble Canal de Entrada (Micrófono Acústico + Teclado MIDI):**
   - Se mantiene la detección por micrófono acústico para pianos reales de pared o cola.
   - Se acordó la incorporación de la **Web MIDI API** (USB-OTG y Bluetooth BLE-MIDI) con un selector claro de entrada para que el usuario pueda alternar entre tocar en piano acústico o teclado digital.

---

## 📂 3. ESTRUCTURA DE ARCHIVOS CONSOLIDADA

```text
e:\Easy Piano\
├── index.html              ← Shell HTML semántico con header gamer, avatar y osciloscopio
├── js/                     ← Módulos JS organizados
│   ├── main.js             ← Orquestación, onboarding, eventos y temporizadores
│   ├── state.js            ← Estado reactivo, estrellas, misiones y tips del avatar
│   ├── practice.js         ← Gameplay loop, modo lección, práctica guiada y modales
│   ├── piano.js            ← Teclado 3D táctil interactivo (marfil/ébano/fieltro)
│   ├── pitch.js            ← Detección de tono por micrófono (DSP)
│   ├── synthesia.js        ← Cascada de notas descendentes y pentagrama vivo
│   └── avatar3d.js         ← Motor 3D WebGL Three.js del compañero interactivo
├── levels.js               ← Base de datos de 44 niveles, canciones, 9 mundos y tips
├── styles.css              ← Sistema de diseño PRO (dark glassmorphism, 3D keys, responsive)
├── manifest.webmanifest    ← Metadatos PWA
├── sw.js                   ← Service Worker (offline-first, cache-first v12)
├── capacitor.config.json   ← Configuración Capacitor: appName="PianoFácil PRO"
├── package.json            ← Dependencias y scripts de build
├── PROYECTO_MEMORIA.md     ← Este archivo maestro de memoria viva
│
├── rules/                  ← Reglas del equipo multi-agente
│   ├── agente-arquitecto.md
│   ├── agente-consultor.md
│   ├── agente-contenido.md
│   ├── agente-diseno.md
│   ├── agente-grafico.md
│   ├── agente-seguridad.md
│   └── agente-tester.md
│
├── www/                    ← Copia web sincronizada para Capacitor
└── android/                ← Proyecto nativo Android generado por Capacitor 7
```

---

## 🛠️ 4. STACK TECNOLÓGICO

| Componente | Tecnología | Detalle |
| :--- | :--- | :--- |
| **Frontend** | HTML5 Semántico + CSS3 Vanilla + JavaScript ES6 Modular | Dark glassmorphism, responsive tablet 16:9 / 16:10 / 4:3 |
| **Avatar Dinámico** | Three.js WebGL (Offline) + Fallback PNG/SVG | Render 3D Chibi interactivo con estados emocionales |
| **Síntesis de Audio** | Web Audio API (6 armónicos + Compressor) | Modelado físico acústico, ADSR, micro-sonidos UI |
| **Detección de Pitch 1.0** | Autocorrelación + BiquadFilter LP 1400Hz | Ventana de ±55 cents guiada por nota esperada |
| **Detección de Pitch & MIDI 2.0** | Autocorrelación + Web MIDI API (USB-OTG / BLE) | Conmutación instantánea Virtual / Micrófono / Teclado Digital |
| **Testing Automatizado** | Playwright E2E | Suite completa en `tests/audit_e2e_full.js` (12/12 ✅, 0 errores) |
| **Empaquetado Android** | Capacitor 7 + Gradle 8.11 | Android SDK nativo, Java OpenJDK 21 |
| **Privacidad & AppSec** | PIANO-SHIELD (COPPA / GDPR-K) | 100% Offline por diseño, audio volátil, PIN parental |

---

## 🚀 5. HOJA DE RUTA: AVANCE FASE POR FASE (VERSIÓN 2.0)

### ✅ Fase 1: Saneamiento, Unificación y Generalización (COMPLETADA)
- [x] Unificación de carpetas en `E:\Easy Piano`.
- [x] Reglas de agentes sincronizadas y saneadas (corrección de byte corrupto y enfoque PIANO-SHIELD).
- [x] Generalización de todos los textos, frases y modales a usuario universal (niño/niña/estudiante).
- [x] Neutralización de nombres en `index.html`, `levels.js`, `manifest.webmanifest`, `capacitor.config.json` y módulos `js/`.

### ✅ Fase 2: Motor de Audio 2.0 y Triple Entrada (COMPLETADA)
- [x] Selector interactivo triple de entrada: 📱 *En Pantalla (Virtual)* / 🎙️ *Piano Acústico (Mic)* / 🎹 *Teclado Digital (MIDI)*.
- [x] Integración de **Web MIDI API** nativa (`js/midi.js`) con auto-detección USB-OTG y Bluetooth MIDI.
- [x] Feedback visual y de estado en vivo (`isbDot` / `isbName` / badge de conexión).
- [x] Prevención de 404s en recursos estáticos de fallback (`mateo_chibi_portrait.png` y planeta procedural).
- [x] Suite de pruebas automatizadas Playwright ampliada y 100% validada (12 pruebas pasadas, 0 errores de consola).

### ✅ Fase 3: Modernización del Build, Pentagrama 2.0 y APK (COMPLETADA)
- [x] Configuración de entorno de desarrollo y vista previa moderna con **Vite** (`npm run dev`, `vite.config.mjs`).
- [x] Motor de **Pentagrama Dinámico 2.0** (`js/practice.js`):
  - Ventana deslizante de compás musical en tiempo real (hasta 4 notas simultáneas con anticipación visual).
  - Detección adaptativa de claves musicales: **Clave de Sol (𝄞)** y **Clave de Fa (𝄢)** según tesitura o mano izquierda.
  - Indicadores pedagógicos de notas completadas (`✓`), nota activa en verde neón con cursor animado y notas siguientes en ámbar.
  - Líneas adicionales superiores e inferiores automáticas y colocación precisa de alteraciones (♯).
- [x] Neutralización completa del diálogo de Duelo (`index.html`).
- [x] Sincronización robusta con `www/` (aislamiento de perfiles de test en `%TEMP%` y cero bloqueos de archivos).
- [x] Suite de pruebas automatizadas Playwright ampliada a 13 pruebas (13/13 ✅, 0 errores) y 6/6 pruebas responsivas multidispositivo.
- [x] Compilación y generación exitosa del paquete Android nativo: **`PianoFacil-v2.apk`** (54 MB, versionCode 2, versionName "2.0").

---

## 📦 6. ENTREGABLES DISPONIBLES DE LA VERSIÓN 2.0
- **APK Instalable Android:** [`PianoFacil-v2.apk`](file:///E:/Easy%20Piano/PianoFacil-v2.apk)
- **Servidor de Desarrollo Local:** `npm run dev` (Vite a 5173 con recarga instantánea)
- **Suite de Pruebas de Calidad:** `npm run test:audit` (Playwright E2E) y `npm run test:responsive`
