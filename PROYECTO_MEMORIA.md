# 🎹 MEMORIA DEL PROYECTO — PianoFácil para Mateo

> Archivo generado el 2026-08-11. Leer esto antes de retomar cualquier tarea del proyecto.

---

## 📋 RESUMEN EJECUTIVO

**PianoFácil para Mateo** es una Progressive Web App (PWA) de aprendizaje de piano diseñada para que **Mateo** (hijo de Sebastián Cortés) aprenda piano de forma gamificada, con soporte para piano virtual en pantalla y detección de notas por micrófono desde un piano real acústico.

- **Repositorio GitHub:** https://github.com/SebastianCortesIbacache/Easy-Piano
- **GitHub Pages (web):** https://sebastiancortesibacache.github.io/Easy-Piano/
- **APK Android local:** `e:\Easy Piano\PianoFacil-Mateo.apk` (4.1 MB)
- **Cuenta GitHub:** `SebastianCortesIbacache`

---

## 📂 ESTRUCTURA DE ARCHIVOS

```
e:\Easy Piano\
├── index.html              ← App completa (HTML + CSS + JS, ~1549 líneas)
├── manifest.webmanifest    ← Metadatos PWA (nombre, iconos, colores)
├── sw.js                   ← Service Worker (modo offline, cache-first)
├── icon-192.png            ← Ícono PWA 192×192
├── icon-512.png            ← Ícono PWA 512×512
├── package.json            ← Dependencias: @capacitor/core, @capacitor/android, @capacitor/cli
├── package-lock.json       ← Lock de dependencias npm
├── capacitor.config.json   ← Config Capacitor: appId=com.pianofacil.mateo
├── README.md               ← Documentación del proyecto
├── .gitignore              ← Excluye: node_modules/, android/, www/, *.apk
├── PROYECTO_MEMORIA.md     ← Este archivo
│
├── node_modules/           ← [IGNORADO EN GIT] paquetes npm instalados
├── www/                    ← [IGNORADO EN GIT] copia web para Capacitor
└── android/                ← [IGNORADO EN GIT] proyecto nativo Android generado por Capacitor
    └── app/
        ├── src/main/
        │   ├── AndroidManifest.xml   ← Permisos: INTERNET, RECORD_AUDIO, MODIFY_AUDIO_SETTINGS
        │   └── assets/public/        ← Copia de www/ embebida en la APK
        └── build/outputs/apk/debug/
            └── app-debug.apk         ← APK compilada (copiar a raíz como PianoFacil-Mateo.apk)
```

---

## 🛠️ STACK TECNOLÓGICO

| Componente | Tecnología | Versión / Detalle |
|---|---|---|
| Frontend | HTML5 + CSS3 Vanilla + JavaScript ES5/6 | Sin frameworks externos |
| Síntesis de audio | Web Audio API (osciladores) | ADSR envelope, 5 armónicos |
| Detección de pitch | Autocorrelación + BiquadFilter LP 1400Hz | Implementación propia en JS |
| Fuentes | Outfit (Google Fonts / fontsource CDN) | 400, 600, 800 |
| PWA | Service Worker + manifest.webmanifest | Cache-first, offline completo |
| Empaquetado Android | Capacitor 7 | @capacitor/android ^7.0.0 |
| Java (compilación) | Microsoft OpenJDK 21 | `C:\Program Files\Microsoft\jdk-21.0.12.8-hotspot` |
| Android SDK | SDK local | `C:\Users\Wusch\AppData\Local\Android\Sdk` |
| Build system | Gradle 8.11.1 | Auto-descargado por Gradle Wrapper |
| Node.js | v24.15.0 | `C:\Program Files\nodejs\` |

---

## 🎮 FUNCIONALIDADES IMPLEMENTADAS

### Sistema de Lecciones
- **40 niveles** organizados en **9 etapas progresivas**
- Etapa 1: Primeros pasos (notas básicas)
- Etapa 2: Postura y técnica (digitación, dedos)
- Etapa 3: Lectura musical (pentagrama, clave de Sol)
- Etapa 4: Melodías reales (escalas, arpegios, canciones)
- Etapa 5: Mano izquierda
- Etapa 6: Canciones mágicas (Jingle Bells, Greensleeves, Cuando los Santos)
- Etapa 7: Dos manos (bajos + melodía)
- Etapa 8: Desafíos virtuosos (Para Elisa, Minueto, Canon en Re)
- Etapa 9: Gran concierto (versiones finales de concierto)

### Canciones incluidas (array LEVELS en index.html)
Martinillo, Estrellita, Himno de la Alegría, Cumpleaños Feliz, Noche de Paz, Campanitas, Cuando los Santos, Greensleeves, Para Elisa, Minueto en Sol, Canon en Re, y versiones a dos manos de las principales.

### Motor de Audio
```javascript
// Síntesis: 5 osciladores armónicos con ADSR y Low-Pass Filter
var H=[1,2,3,4,5], G=[1,.45,.22,.12,.06];
// Cada armónico tiene ganancia decreciente, pequeño detune aleatorio
// El envelope exponencial simula la caída natural del piano
```

### Detección de Micrófono
- **Algoritmo:** Autocorrelación refinada con parabolic interpolation
- **Filtro:** BiquadFilter tipo `lowpass` a **1400 Hz** → elimina armónicos altos de pianos acústicos que causan saltos de octava
- **Rango:** 60–1200 Hz (notas de piano C2–D6 aprox.)
- **Debounce:** 6 frames estables antes de emitir nota, mínimo 220ms entre notas

### Gamificación
- Sistema de **estrellas** (1-3 por nivel según precisión)
- **12 medallas** desbloqueables (Primer paso, Dedos de oro, Lector de partituras, Pianista graduado, etc.)
- Mensajes de refuerzo positivo personalizados para **Mateo, Seba, Fer y Bernardita**
- Progreso guardado en `localStorage` (claves: `pf_path`, `pf_badges`, `pf_time`, `pf_settings`)

### UI/UX
- Diseño **dark mode** con glassmorphism (`backdrop-filter: blur`)
- Piano de 37 teclas (MIDI 48–84, Do3 a Do6) en SVG/HTML
- Partituras generadas dinámicamente en **SVG** (clave de Sol, líneas, notas, plicas, sostenidos)
- Visualización de dedos en SVG de manos (izquierda y derecha)
- Soporte táctil, ratón y **teclado físico** (mapeado en KEYMAP)
- Modo grabación de melodías libres

---

## 🐛 BUGS CORREGIDOS (historial)

### Bug 1: `$('sens')` sin selector `#` → TypeError
**Commit:** `912b571`  
**Descripción:** La función `gateVal()` usaba `$('sens')` (busca tag HTML `<sens>`) en lugar de `$('#sens')` (busca por ID). Retornaba `null` → crash en el loop del micrófono.  
**Fix:** Cambiado a `$('#sens').value`

### Bug 2: Null-safety insuficiente en funciones de micrófono
**Commit:** `a169b23`  
**Descripción:** `gateVal()`, `octShift()` y `micFrame()` usaban `querySelector` sin guards. En GitHub Pages (con caché agresivo o timing de DOM) podían obtener null en elementos dinámicos.  
**Fix:** Reemplazados por `document.getElementById()` con valores de fallback defensivos:
```javascript
function gateVal(){
  var el=document.getElementById('sens');
  return 0.0005*Math.pow(10,((el?parseFloat(el.value):50)/50));
}
function octShift(){
  var el=document.getElementById('octSel');
  return el?parseInt(el.value,10)||0:0;
}
// + null guards en micFrame() para meterFill, detNote, detHz
```

### Fix CSS: Vendor prefixes y estilos inline
**Commit:** (parte del commit inicial)  
**Descripción:** Advertencias del IDE de compatibilidad.  
**Fix:**
- `user-select` → añadido `-webkit-user-select` antes
- `backdrop-filter` → añadido `-webkit-backdrop-filter` antes
- Estilos inline migrados a clases CSS (`.fnote.n1`, `.fnote.n2`, `.fnote.n3`, `.sub.noMb`, `#courseTxt`, `.recGroup`, `.srcBtn small`)

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
# 1. Copiar index.html actualizado a www/
Copy-Item "e:\Easy Piano\index.html" "e:\Easy Piano\www\index.html" -Force

# 2. Sincronizar con el proyecto Android
cd "e:\Easy Piano"
npx cap sync android

# 3. Compilar APK (requiere las variables de entorno)
$env:JAVA_HOME="C:\Program Files\Microsoft\jdk-21.0.12.8-hotspot"
$env:ANDROID_HOME="$env:LOCALAPPDATA\Android\Sdk"
$env:Path="$env:JAVA_HOME\bin;$env:Path"
Set-Location "e:\Easy Piano\android"
.\gradlew.bat assembleDebug

# 4. Copiar APK a la raíz del proyecto
Copy-Item "e:\Easy Piano\android\app\build\outputs\apk\debug\app-debug.apk" `
          "e:\Easy Piano\PianoFacil-Mateo.apk" -Force
```

### Publicar cambios en GitHub
```powershell
cd "e:\Easy Piano"
git add index.html
git commit -m "feat/fix: descripcion del cambio"
git push
# GitHub Pages se actualiza automáticamente en ~2 minutos
# Hacer Ctrl+Shift+R en el navegador para forzar recarga sin caché
```

### Reinstalar dependencias (si se borra node_modules)
```powershell
cd "e:\Easy Piano"
npm install
npx cap add android    # Solo si no existe carpeta android/
```

---

## ⚙️ CONFIGURACIÓN DE CAPACITOR

**`capacitor.config.json`:**
```json
{
  "appId": "com.pianofacil.mateo",
  "appName": "PianoFácil de Mateo",
  "webDir": "www",
  "bundledWebRuntime": false
}
```

**`android/app/src/main/AndroidManifest.xml` — Permisos:**
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
```

---

## 🚀 PRÓXIMOS PASOS SUGERIDOS

1. **Activar GitHub Pages:**
   - Settings → Pages → Branch: `main` / Folder: `(root)` → Save
   - URL: `https://sebastiancortesibacache.github.io/Easy-Piano/`

2. **Agregar más canciones:**
   - Añadir arrays de notas al bloque `/* ============ CANCIONES BASE ============ */`
   - Crear la entrada en el array `LEVELS` con `stage`, `seq`, `fing`, etc.

3. **Mejorar la APK para distribución (Release firmada):**
   - Generar un keystore con `keytool`
   - Ejecutar `gradlew assembleRelease` con signing config en `build.gradle`
   - La APK release es más pequeña y no requiere "fuentes desconocidas" en algunos dispositivos

4. **Subir APK a GitHub Releases:**
   ```
   GitHub → Repositorio → Releases → Create a new release → Adjuntar PianoFacil-Mateo.apk
   ```
   Así Mateo puede descargarla directamente desde el teléfono.

5. **Soporte para canciones con mano izquierda (bajos) en partitura:**
   - Actualmente `renderStaff()` muestra solo clave de Sol
   - Se puede agregar clave de Fa para las etapas 7-9

---

## 👨‍👩‍👦 CONTEXTO FAMILIAR

| Persona | Rol en la app |
|---|---|
| **Mateo** | El alumno — destinatario principal de la app |
| **Seba (Sebastián)** | El papá — desarrolló el proyecto |
| **Fer** | La hermana de Mateo |
| **Bernardita** | La mamá |

Los mensajes de refuerzo positivo en `ENTHUSIASM[]` mencionan a todos por nombre para personalizar la experiencia.

---

## 📊 ESTADO ACTUAL (2026-08-11)

- ✅ PWA completa y funcional en GitHub Pages
- ✅ APK de Android compilada y lista para instalar (`PianoFacil-Mateo.apk`)
- ✅ Detección de micrófono funcionando con Low-Pass Filter
- ✅ Bug del TypeError en micrófono corregido
- ✅ CSS compatible con Safari/iOS
- ✅ Repositorio público en GitHub con historial de commits
- ⏳ GitHub Pages aún por activar en Settings del repo (opcional)
- ⏳ APK Release firmada (opcional, para distribución sin "fuentes desconocidas")
