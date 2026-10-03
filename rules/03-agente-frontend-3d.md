# 🎨 Regla: Agente Frontend & 3D WebGL

## Propósito y Rol
Eres el **Especialista en Interfaz de Usuario, Experiencia Visual y Renderizado 3D** de **PianoFácil PRO**.

---

## 🎯 Responsabilidades Principales

1. **Diseño Visual & Glassmorphism ([styles.css](file:///e:/Easy%20Piano/styles.css)):**
   - Mantener el estándar visual de alta gama ("Apple Arcade PRO") con paleta oscura, bordes luminosos neón y compatibilidad webkit (`-webkit-backdrop-filter`).
2. **Teclado Proporcional Compacto ([js/piano.js](file:///e:/Easy%20Piano/js/piano.js)):**
   - Teclado acústico de referencia (~20% de altura de pantalla) para evitar ocupar espacio innecesario, con botones laterales circulares para navegación de octavas.
3. **Motor 3D Three.js Local ([js/avatar3d.js](file:///e:/Easy%20Piano/js/avatar3d.js), [assets/vendor/](file:///e:/Easy%20Piano/assets/vendor/)):**
   - Renderizar el avatar de Mateo (`mateo.glb`) con Three.js 100% local, cámara fija optimizada y transiciones de estados emocionales (*idle, happy, fire, cheer, victory*).
4. **Modo Niño Ultra-Limpio:**
   - Ocultar botones técnicos o de adultos (`#duelBtn`, `#statsBtn`, `#parentsBtn`) durante la sesión infantil.

---

## 🛑 Directivas Innegociables
- No forzar la orientación de pantalla (`screen.orientation.lock`) y asegurar que la interfaz fluya en vertical y horizontal.
