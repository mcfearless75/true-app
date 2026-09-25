// Builds www/ — the copy of True that goes inside the iOS/Android app.
// The website is still served straight from the repo root; this only
// adds native.js (the app's private-folder storage) and the tag that
// loads it, so the web build never carries native code.

import { build } from 'esbuild';
import { mkdir, readFile, writeFile, copyFile, rm } from 'node:fs/promises';

const OUT = 'www';
const ASSETS = ['manifest.json', 'icon.svg', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png'];

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });

await build({
  entryPoints: ['src/native.js'],
  bundle: true,
  minify: true,
  format: 'iife',
  target: ['es2020', 'safari15'],
  outfile: `${OUT}/native.js`,
});

// native.js must run before the app script, so it goes first in <head>
const html = await readFile('index.html', 'utf8');
const tag = '<script src="native.js"></script>';
if (!html.includes('<head>')) throw new Error('index.html has no <head> to inject native.js into');
await writeFile(`${OUT}/index.html`, html.replace('<head>', `<head>\n  ${tag}`));

for (const f of ASSETS) await copyFile(f, `${OUT}/${f}`);

console.log(`www/ built: index.html + native.js + ${ASSETS.length} assets`);
