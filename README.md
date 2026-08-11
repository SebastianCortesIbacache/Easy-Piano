# 🎹 Easy Piano — PianoFácil para Mateo

Aplicación Web Progresiva (PWA) de aprendizaje de piano diseñada especialmente para **Mateo**.

## ✨ Características

- **40 lecciones** organizadas en 9 etapas progresivas
- **Canciones famosas:** Estrellita, Martinillo, Cumpleaños Feliz, Noche de Paz, Jingle Bells, Para Elisa, Canon en Re y más
- **Piano virtual en pantalla** con soporte táctil, ratón y teclado
- **Modo Piano Real:** detección de notas por micrófono con Low-Pass Filter (1400 Hz) para pianos acústicos
- **Sistema de gamificación:** estrellas, medallas y mensajes de refuerzo positivo
- **Partituras en SVG** generadas en tiempo real
- **Digitación de manos** con visualización de dedos
- **PWA completa:** instalable y 100% offline
- **APK de Android** empaquetada con Capacitor

## 📂 Estructura del Proyecto

```
Easy Piano/
├── index.html          # App completa (HTML + CSS + JS)
├── manifest.webmanifest # Metadatos PWA
├── sw.js               # Service Worker (modo offline)
├── icon-192.png        # Ícono PWA 192×192
├── icon-512.png        # Ícono PWA 512×512
├── package.json        # Dependencias Capacitor
└── capacitor.config.json # Configuración APK Android
```

## 🚀 Uso Local

```bash
# Servidor simple con Python
python -m http.server 8080
# Abre: http://localhost:8080
```

## 📱 APK para Android

La APK se genera con Capacitor + Android SDK. Ver instrucciones en el [Walkthrough](walkthrough.md).

---

Hecho con ❤️ para que Mateo aprenda piano 🎹
