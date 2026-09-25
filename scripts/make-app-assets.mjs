// Draws the source images for the app icon and splash screen from the True
// flame, then @capacitor/assets turns them into every size iOS and Android
// need. Re-run after a brand change:  npm run assets
//
// Colours come from the brand tokens in index.html (--tr, --glow, --bg).

import sharp from 'sharp';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { execSync } from 'node:child_process';

const TR = '#1A7A6E';     // --tr
const GLOW = '#25A99A';   // --glow
const BG = '#FBF7F0';     // --bg, what the app opens onto

// The flame from icon.svg, drawn in a 512 box (outer, glow, core)
const FLAME = `
  <path d="M256 96C256 96 136 216 136 320C136 391.2 189.9 448 256 448C322.1 448 376 391.2 376 320C376 216 256 96 256 96Z" fill="white" fill-opacity="0.95"/>
  <path d="M256 232C256 232 188 300 188 352C188 389.6 218.4 420 256 420C293.6 420 324 389.6 324 352C324 300 256 232 256 232Z" fill="${GLOW}" fill-opacity="0.75"/>
  <path d="M256 318C256 318 222 352 222 378C222 396.8 237.2 412 256 412C274.8 412 290 396.8 290 378C290 352 256 318 256 318Z" fill="${TR}" fill-opacity="0.55"/>`;

// The lock-screen mark (teal flame on light), drawn in a 44x52 box
const MARK = `
  <path d="M22 4C22 4 8 18 8 30C8 38.28 14.27 45 22 45C29.73 45 36 38.28 36 30C36 18 22 4 22 4Z" fill="${TR}"/>
  <path d="M22 20C22 20 14 28 14 34C14 38.42 17.58 42 22 42C26.42 42 30 38.42 30 34C30 28 22 20 22 20Z" fill="${GLOW}" fill-opacity="0.85"/>
  <path d="M22 30C22 30 18 34 18 37C18 39.21 19.79 41 22 41C24.21 41 26 39.21 26 37C26 34 22 30 22 30Z" fill="white" fill-opacity="0.6"/>`;

// Flame spans y 96–448 of its 512 box, so its centre sits at (256, 272)
function flameAt(size, heightFrac) {
  const s = (size * heightFrac) / 352;
  const tx = size / 2 - 256 * s;
  const ty = size / 2 - 272 * s;
  return `<g transform="translate(${tx} ${ty}) scale(${s})">${FLAME}</g>`;
}

const svg = (w, h, body) =>
  Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${body}</svg>`);

await mkdir('assets', { recursive: true });

// iOS + legacy Android: full square — the OS rounds the corners itself
await sharp(svg(1024, 1024, `<rect width="1024" height="1024" fill="${TR}"/>${flameAt(1024, 0.66)}`))
  .png().toFile('assets/icon-only.png');

// Android adaptive icon: the launcher masks it to a circle, squircle etc.
// and may crop to the middle 61%, so the flame stays well inside that
await sharp(svg(1024, 1024, flameAt(1024, 0.46))).png().toFile('assets/icon-foreground.png');
await sharp(svg(1024, 1024, `<rect width="1024" height="1024" fill="${TR}"/>`)).png().toFile('assets/icon-background.png');

// Splash: the lock-screen mark on the app's own background, so opening
// True flows straight into it with no flash of a different colour
const S = 2732, markH = 360, markW = markH * 44 / 52;
const splash = svg(S, S, `<rect width="${S}" height="${S}" fill="${BG}"/>
  <g transform="translate(${(S - markW) / 2} ${(S - markH) / 2}) scale(${markH / 52})">${MARK}</g>`);
await sharp(splash).png().toFile('assets/splash.png');
await sharp(splash).png().toFile('assets/splash-dark.png');   // no dark theme yet — same look

console.log('assets/: icon-only, icon-foreground, icon-background, splash, splash-dark');

// Every iOS / Android size from those sources
execSync(
  'npx @capacitor/assets generate --android --ios' +
  ' --iconBackgroundColor "#1A7A6E" --iconBackgroundColorDark "#1A7A6E"' +
  ` --splashBackgroundColor "${BG}" --splashBackgroundColorDark "${BG}"`,
  { stdio: 'inherit' }
);

// Android adaptive icon, done by hand. @capacitor/assets makes 48dp layers
// wrapped in insets, which launchers draw small with a pale ring round
// them. Adaptive layers are 108dp: the foreground is redrawn at that size
// per density, and the background is a flat colour (it wrote white).
const RES = 'android/app/src/main/res';
const DENSITIES = { mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 };
for (const [d, k] of Object.entries(DENSITIES)) {
  const px = Math.round(108 * k);
  await sharp(svg(px, px, flameAt(px, 0.46))).png()
    .toFile(`${RES}/mipmap-${d}/ic_launcher_foreground.png`);
}
const ADAPTIVE = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background" />
    <foreground android:drawable="@mipmap/ic_launcher_foreground" />
</adaptive-icon>
`;
await writeFile(`${RES}/mipmap-anydpi-v26/ic_launcher.xml`, ADAPTIVE);
await writeFile(`${RES}/mipmap-anydpi-v26/ic_launcher_round.xml`, ADAPTIVE);
await writeFile(`${RES}/values/ic_launcher_background.xml`, `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">${TR}</color>
</resources>
`);
// The generated background PNGs are unused now that the colour does the job
for (const d of Object.keys(DENSITIES)) {
  await rm(`${RES}/mipmap-${d}/ic_launcher_background.png`, { force: true });
}
console.log('adaptive icon: 108dp foreground + flat teal background');
