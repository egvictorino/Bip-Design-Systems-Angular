#!/usr/bin/env node
// Regenera .size-limit.cjs a partir de dist/bip-angular/ — un entry por FESM (una entrada
// por secondary entry point, ver ng-package.json) más styles/bip.css. Correr después de
// `pnpm build` y de un cambio deliberado de tamaño (nuevo componente, dependencia nueva),
// nunca a mano: los límites son el tamaño medido (gzip) más ~15% de margen, un guard de
// crecimiento — no un objetivo — así que deben reflejar lo que el build produce de verdad.
//
// Uso: pnpm build && node scripts/generate-size-limit.cjs
'use strict';

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const REPO_ROOT = path.resolve(__dirname, '..');
const FESM_DIR = path.join(REPO_ROOT, 'dist/bip-angular/fesm2022');
const CSS_PATH = path.join(REPO_ROOT, 'dist/bip-angular/styles/bip.css');
const OUT_PATH = path.join(REPO_ROOT, '.size-limit.cjs');
const MARGIN = 1.15;

function gzipKB(filePath) {
  const content = fs.readFileSync(filePath);
  const gzipSize = zlib.gzipSync(content).length;
  return Math.max(1, Math.ceil((gzipSize * MARGIN) / 1024));
}

if (!fs.existsSync(FESM_DIR)) {
  console.error(`No existe ${FESM_DIR} — corré "pnpm build" primero.`);
  process.exit(1);
}

const entries = fs
  .readdirSync(FESM_DIR)
  .filter((f) => f.endsWith('.mjs'))
  .map((f) => {
    const base = f.replace(/\.mjs$/, '');
    const entryName =
      base === 'bip-design-systems-angular' ? '.' : base.replace('bip-design-systems-angular-', '');
    const relPath = `dist/bip-angular/fesm2022/${f}`;
    return { name: entryName, path: relPath, limitKB: gzipKB(path.join(FESM_DIR, f)) };
  })
  .sort((a, b) => a.name.localeCompare(b.name));

const cssRelPath = 'dist/bip-angular/styles/bip.css';
const cssLimitKB = gzipKB(CSS_PATH);

const lines = [
  '// Generado por scripts/generate-size-limit.cjs — no editar a mano (ver ese script).',
  '// Un entry por FESM (gzip) + styles/bip.css. Los límites son el tamaño medido (gzip) más',
  '// ~15%: un guard de crecimiento, no un objetivo — si un componente crece más de eso de',
  '// golpe, size-limit avisa en CI para que sea una decisión consciente, no un desliz.',
  'module.exports = [',
  ...entries.map((e) => {
    const label = e.name === '.' ? 'core (entry primario, barrel import)' : e.name;
    return `  { name: '${label}', path: '${e.path}', limit: '${e.limitKB} KB', gzip: true },`;
  }),
  `  { name: 'styles/bip.css', path: '${cssRelPath}', limit: '${cssLimitKB} KB', gzip: true },`,
  '];',
  '',
];

fs.writeFileSync(OUT_PATH, lines.join('\n'));
console.log(`Escrito ${path.relative(REPO_ROOT, OUT_PATH)} con ${entries.length + 1} entries.`);
