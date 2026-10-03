const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const wwwDir = path.join(rootDir, 'www');

if (!fs.existsSync(wwwDir)) {
  fs.mkdirSync(wwwDir, { recursive: true });
}

const ignored = new Set(['node_modules', '.git', 'android', 'tests', 'www', 'scripts', '.vscode', 'package-lock.json', 'dist', '.temp_playwright']);

const entries = fs.readdirSync(rootDir);
for (const entry of entries) {
  if (ignored.has(entry) || entry.startsWith('.temp') || entry.endsWith('.apk')) continue;
  const src = path.join(rootDir, entry);
  const dest = path.join(wwwDir, entry);
  fs.cpSync(src, dest, { recursive: true });
}

console.log('✅ Web assets sincronizados exitosamente a www/');
