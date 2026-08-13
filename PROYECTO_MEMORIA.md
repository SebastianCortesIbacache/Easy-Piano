# 🎹 MEMORIA DEL PROYECTO — PianoFácil para Mateo

> Archivo de Memoria Viva del Proyecto. Actualizado al 2026-08-13. Leer esto antes de retomar cualquier tarea del proyecto.

---

## 📋 RESUMEN EJECUTIVO

**PianoFácil para Mateo** es una Progressive Web App (PWA) y aplicación nativa Android de aprendizaje de piano diseñada para que **Mateo** (hijo de Sebastián Cortés) aprenda piano de forma gamificada, con soporte para piano virtual en pantalla y detección de notas por micrófono desde un piano acústico real.

- **Repositorio GitHub:** https://github.com/SebastianCortesIbacache/Easy-Piano
- **GitHub Pages (web):** https://sebastiancortesibacache.github.io/Easy-Piano/
- **APK Android local:** `e:\Easy Piano\PianoFacil-Mateo.apk` (4.5 MB)
- **Cuenta GitHub:** `SebastianCortesIbacache`

---

## 📂 ESTRUCTURA DE ARCHIVOS

```
e:\Easy Piano\
├── index.html              ← App HTML semántico modularizado (~230 líneas)
├── app.js                  ← Lógica principal, audio, micrófono, gamificación y partitura (~1175 líneas)
├── levels.js               ← Base de datos de 40 niveles, canciones, etapas, tips y estadísticas (~500 líneas)
├── styles.css              ← Sistema de diseño completo, tokens, glassmorphism, responsive landscape (~990 líneas)
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
|---|---|---|
| Frontend | HTML5 + CSS Vanilla + JavaScript ES6 Modular | Separado en `app.js`, `levels.js`, `styles.css` |
| Síntesis de audio | Web Audio API (osciladores) | ADSR envelope, 5 armónicos |
| Detección de pitch | Autocorrelación + BiquadFilter LP 1400Hz | Detección continua optimizada para piano físico |
| QA & Testing | Playwright (E2E Automated Testing) | Suite en Node.js (`run_playwright_tests.js`) |
| Fuentes | Outfit (Google Fonts / fontsource CDN) | 400, 600, 700, 800 |
| PWA | Service Worker + manifest.webmanifest | Cache-first, offline completo |
| Empaquetado Android | Capacitor 7 | `@capacitor/android` ^7.0.0 |
| Java (compilación) | Microsoft OpenJDK 21 | `C:\Program Files\Microsoft\jdk-21.0.12.8-hotspot` |
| Android SDK | SDK local | `C:\Users\Wusch\AppData\Local\Android\Sdk` |
| Build system | Gradle 8.11.1 | Auto-descargado por Gradle Wrapper |
| Node.js | v24.15.0 | `C:\Program Files\nodejs\` |

---

## 🎮 FUNCIONALIDADES IMPLEMENTADAS

### Sistema de Lecciones & Mapa de Nodos (Super Mario World / Duolingo)
- **40 niveles** organizados en **9 etapas progresivas**
- **Nodos 3D Interactivos (`.nodeBtn`)**:
  - `done`: Verde esmeralda con checkmark `✓` y estrellas obtenidas (`★★★`).
  - `current`: Dorado resplandeciente con animación `nodePulse` palpitante (`▶`).
  - `locked`: Gris atenuado con ícono de candado `🔒`.
- Etapa 1: Primeros pasos (notas básicas)
- Etapa 2: Postura y técnica (digitación, postura de mano)
- Etapa 3: Lectura musical (pentagrama, clave de Sol)
- Etapa 4: Melodías reales (escalas, arpegios, canciones)
- Etapa 5: Mano izquierda
- Etapa 6: Canciones mágicas (Jingle Bells, Greensleeves, Cuando los Santos)
- Etapa 7: Dos manos (bajos + melodía)
- Etapa 8: Desafíos virtuosos (Para Elisa, Minueto, Canon en Re)
- Etapa 9: Gran concierto (versiones finales de concierto)

### Canciones Incluidas
Martinillo, Estrellita, Himno de la Alegría, Cumpleaños Feliz, Noche de Paz, Campanitas, Cuando los Santos, Greensleeves, Para Elisa, Minueto en Sol, Canon en Re, Super Mario, Harry Potter, Baby Shark, Piratas del Caribe, y versiones a dos manos de las principales.

### Motor de Audio & Pitch Detection
- **Síntesis:** 5 osciladores armónicos con ADSR y Low-Pass Filter.
- **Detección por Micrófono:** Autocorrelación refinada con interpolación parabólica y filtro pasabajo de 1400 Hz para el piano real de Mateo.

### Efectos Arcade & Feedback Visual
- **Partículas & Emojis Flotantes**: Emojis musicales (`🎵`, `🎶`, `✨`, `⭐`, `🎹`, `💫`) y chispas de colores al tocar notas o ser detectadas por el micrófono.
- **Efecto Ripple (`.keyRipple`)**: Anillos divergentes concéntricos sobre las teclas activadas.
- **Pentagrama Vivo**: SVG dinámico con cursor resplandeciente (`.staffCursor`) en degradado dorado/púrpura que señala la nota activa.

---

## 🔨 COMANDOS PARA RETOMAR EL PROYECTO

### Servir localmente (modo web)
```powershell
cd "e:\Easy Piano"
python -m http.server 8080
# Abrir: http://localhost:8080
```

### Reconstruir la APK Android
```powershell
# 1. Copiar activos a www/
Copy-Item app.js www\ -Force
Copy-Item styles.css www\ -Force
Copy-Item index.html www\ -Force

# 2. Sincronizar con Capacitor Android
cd "e:\Easy Piano"
npx cap sync android

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

### Ejecutar Pruebas Automatizadas (Playwright)
```powershell
cd "e:\Easy Piano"
node C:\Users\Wusch\.gemini\antigravity\brain\95be7e29-99b6-4943-a043-49146e6ecb78\scratch\run_playwright_tests.js
```

---

## 👨‍👩‍👦 CONTEXTO FAMILIAR

| Persona | Rol en la app |
|---|---|
| **Mateo** | El alumno — destinatario principal de la app |
| **Seba (Sebastián)** | El papá — desarrolló el proyecto |
| **Fer** | La hermana de Mateo |
| **Bernardita** | La mamá |

---

## 📊 ESTADO ACTUAL (2026-08-13)

- ✅ **PWA completa, modular y limpia**: Separación total de HTML, CSS y JS (`app.js`, `levels.js`, `styles.css`).
- ✅ **Mapa de Lecciones Super Mario / Duolingo**: Renderizado interactivo de nodos 3D (`.mapGrid` y `.nodeBtn`).
- ✅ **Feedback Arcade & Pentagrama Vivo**: Sistema de partículas, emojis, ondas divergentes `keyRipple` y cursor de pentagrama en tiempo real.
- ✅ **QA Automático con Playwright**: Pruebas E2E ejecutadas y aprobadas con `0 ERRORES DE CONSOLA`.
- ✅ **APK Android Nativa Compilada**: Generado `PianoFacil-Mateo.apk` (4.5 MB) verificado y listo para instalar en la tablet de Mateo.
