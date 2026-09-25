// Store graphics from real app screenshots:  npm run store
//
//   store/raw/*.png      emulator screenshots of the demo account (Jordan)
//   store/raw-ios/*.png  the same screens where iOS words them differently
//   store/play/          Google Play: 8 phone shots (1080x1920), the
//                        1024x500 feature graphic and the 512 icon
//   store/appstore/      App Store: 8 iPhone 6.9" shots (1290x2796)
//
// Captions are drawn in Segoe UI (Windows). Every caption has to be true of
// the app — this is a listing for young people and the adults around them.

import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const TR = '#1A7A6E', TRDARK = '#0F5349', GLOW = '#25A99A', BG = '#FBF7F0', TEXT2 = '#5f5e5a';
const FONT = "Segoe UI, 'Helvetica Neue', Arial, sans-serif";

const SHOTS = [
  ['01-lock',    ['Yours.', "Nobody else's."],            'Locked with your own code. No adult logins.'],
  ['02-home',    ['A minute a day,', 'just for you.'],     'Check in, write, and notice what changes.'],
  ['03-mood',    ['How are you', 'actually feeling?'],     'Five honest answers. None of them wrong.'],
  ['04-journal', ["Write what you can't", 'say out loud.'], 'A prompt when you get stuck.'],
  ['05-journey', ["See how far", "you've come."],          'Moods, words and milestones in one place.'],
  ['06-letter',  ['Write to', 'future you.'],              'Sealed until the age you choose.'],
  ['07-me',      ['Private, even if', 'someone picks it up.'], 'Fingerprint unlock and a "Notes" disguise.'],
  ['08-calm',    ["When everything's", 'loud.'],           'Breathe, or reach help in one tap.'],
];

const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/'/g, '&#39;');
const svg = (w, h, body) => Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${body}</svg>`);

await mkdir('store/play', { recursive: true });
await mkdir('store/appstore', { recursive: true });

// One framed screenshot: caption on top, the app screen below in a soft
// rounded card. Laid out on a 1080-wide grid, scaled for bigger canvases.
async function frameShot({ src, crop, W, H, phoneW, phoneTop, title, sub, out }) {
  const k = W / 1080;
  let img = sharp(src);
  if (crop) img = img.extract(crop);
  const meta = crop || await sharp(src).metadata();
  const pw = Math.round(phoneW * k), ph = Math.round(pw * meta.height / meta.width);
  const px = Math.round((W - pw) / 2), py = Math.round(phoneTop * k), r = Math.round(44 * k);

  const phone = await img.resize(pw, ph)
    .composite([{ input: svg(pw, ph, `<rect width="${pw}" height="${ph}" rx="${r}"/>`), blend: 'dest-in' }])
    .png().toBuffer();

  const back = svg(W, H, `
    <defs>
      <radialGradient id="g" cx="50%" cy="0%" r="75%">
        <stop offset="0" stop-color="#E6F5F4"/><stop offset="1" stop-color="${BG}"/>
      </radialGradient>
      <filter id="s" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="${18 * k}" stdDeviation="${26 * k}" flood-color="${TRDARK}" flood-opacity="0.22"/>
      </filter>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#g)"/>
    ${title.map((t, i) => `<text x="${W / 2}" y="${(150 + i * 84) * k}" text-anchor="middle" font-family="${FONT}" font-weight="700" font-size="${72 * k}" letter-spacing="${-1 * k}" fill="${TRDARK}">${esc(t)}</text>`).join('')}
    <text x="${W / 2}" y="${(150 + title.length * 84 + 34) * k}" text-anchor="middle" font-family="${FONT}" font-size="${36 * k}" fill="${TEXT2}">${esc(sub)}</text>
    <rect x="${px}" y="${py}" width="${pw}" height="${ph}" rx="${r}" fill="${BG}" filter="url(#s)"/>
    <rect x="${px - 1}" y="${py - 1}" width="${pw + 2}" height="${ph + 2}" rx="${r + 1}" fill="none" stroke="${TRDARK}" stroke-opacity="0.12" stroke-width="${2 * k}"/>`);

  // Both stores want no alpha — flatten runs before composite in one
  // pipeline, so it gets its own pass to actually drop the channel
  const framed = await sharp(back).composite([{ input: phone, left: px, top: py }]).png().toBuffer();
  await sharp(framed).flatten({ background: BG }).removeAlpha().png().toFile(out);
}

// ─── Google Play: 1080x1920 (Play caps phones at 2:1) ────────────────
for (const [name, title, sub] of SHOTS) {
  await frameShot({ src: `store/raw/${name}.png`, W: 1080, H: 1920, phoneW: 630, phoneTop: 440,
    title, sub, out: `store/play/phone-${name}.png` });
}

// ─── App Store: 1290x2796 (the 6.9" iPhone slot) ─────────────────────
// Android's status bar and gesture bar are cropped off — Apple rejects
// screenshots that show another platform's interface. Where iOS words a
// screen differently (Face ID), store/raw-ios has that version.
const IOS_CROP = { left: 0, top: 64, width: 1080, height: 2336 - 64 };
const IOS_SUB = { '07-me': 'Face ID unlock and a "Notes" disguise.' };
for (const [name, title, sub] of SHOTS) {
  const src = existsSync(`store/raw-ios/${name}.png`) ? `store/raw-ios/${name}.png` : `store/raw/${name}.png`;
  await frameShot({ src, crop: IOS_CROP, W: 1290, H: 2796, phoneW: 760, phoneTop: 470,
    title, sub: IOS_SUB[name] || sub, out: `store/appstore/iphone-6.9-${name}.png` });
}

// ─── Feature graphic, 1024x500 ───────────────────────────────────────
const FLAME = `
  <path d="M256 96C256 96 136 216 136 320C136 391.2 189.9 448 256 448C322.1 448 376 391.2 376 320C376 216 256 96 256 96Z" fill="white" fill-opacity="0.95"/>
  <path d="M256 232C256 232 188 300 188 352C188 389.6 218.4 420 256 420C293.6 420 324 389.6 324 352C324 300 256 232 256 232Z" fill="${GLOW}" fill-opacity="0.75"/>
  <path d="M256 318C256 318 222 352 222 378C222 396.8 237.2 412 256 412C274.8 412 290 396.8 290 378C290 352 256 318 256 318Z" fill="${TR}" fill-opacity="0.55"/>`;
await sharp(svg(1024, 500, `
    <defs><linearGradient id="t" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${TR}"/><stop offset="1" stop-color="${TRDARK}"/>
    </linearGradient></defs>
    <rect width="1024" height="500" fill="url(#t)"/>
    <g transform="translate(96 88) scale(0.62)">${FLAME}</g>
    <text x="410" y="238" font-family="${FONT}" font-weight="700" font-size="128" letter-spacing="-5" fill="white">true</text>
    <text x="414" y="306" font-family="${FONT}" font-size="40" fill="white" fill-opacity="0.9">Your words. Your truth.</text>`))
  .flatten({ background: TR }).png().toFile('store/play/feature-graphic.png');

// ─── Hi-res icon, 512x512 (Play rounds it; must be opaque) ────────────
await sharp('assets/icon-only.png').resize(512).flatten({ background: TR }).png().toFile('store/play/icon-512.png');

console.log(`store/play/: ${SHOTS.length} phone shots + feature graphic + icon · store/appstore/: ${SHOTS.length} iPhone 6.9" shots`);
