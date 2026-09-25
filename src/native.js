// Native storage for the installed app (Capacitor). Bundled into
// www/native.js by scripts/build-www.mjs and loaded ONLY by the app build —
// the website never sees this file.
//
// Why: inside an iOS/Android WebView, localStorage and IndexedDB are the
// browser's storage, which the OS is allowed to clear. The words are the
// product, so in the app they live in the app's own private folder: not
// visible to other apps and never evicted. localStorage stays as a fast
// mirror only.
//
// LibraryNoCloud, not Data: on iOS Data is Documents, which iCloud backs up
// — "stays on this phone" has to be literally true. (Android's equivalent,
// Google auto-backup, is switched off with allowBackup="false".)

import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';

const DIR = Directory.LibraryNoCloud;
const MEDIA = 'media';

// ─── State: two alternating slots ──────────────────────────────
// Each save goes to the other slot with a higher sequence number. A write
// torn by a crash or a flat battery can only ever damage one slot, and the
// read picks the newest slot that's whole — so the previous save survives.
const SLOTS = ['state-a.json', 'state-b.json'];
let seq = 0;
let queue = Promise.resolve();   // saves land in order, never interleaved

async function readText(path) {
  try {
    const r = await Filesystem.readFile({ path, directory: DIR, encoding: Encoding.UTF8 });
    return typeof r.data === 'string' ? r.data : null;
  } catch {
    return null;   // missing file
  }
}

async function readState() {
  let best = null;
  for (const path of SLOTS) {
    const text = await readText(path);
    if (!text) continue;
    try {
      const o = JSON.parse(text);
      if (typeof o.seq === 'number' && typeof o.data === 'string' && (!best || o.seq > best.seq)) best = o;
    } catch {}   // torn slot — the other one is the good copy
  }
  if (!best) return null;
  seq = best.seq;
  return best.data;
}

function writeState(data) {
  const p = queue.then(() => {
    const next = seq + 1;
    return Filesystem.writeFile({
      path: SLOTS[next % 2], directory: DIR, encoding: Encoding.UTF8,
      data: JSON.stringify({ seq: next, data }),
    }).then(() => { seq = next; });
  });
  queue = p.catch(() => {});
  return p;   // rejects if the write failed — the caller must say so
}

// ─── Media: one file for the bytes, one for what they are ─────
async function mediaPut({ id, kind, type, data }) {
  await Filesystem.writeFile({ path: `${MEDIA}/${id}.bin`, directory: DIR, data, recursive: true });
  await Filesystem.writeFile({
    path: `${MEDIA}/${id}.json`, directory: DIR, encoding: Encoding.UTF8,
    data: JSON.stringify({ id, kind, type }), recursive: true,
  });
}

async function mediaGet(id) {
  const metaText = await readText(`${MEDIA}/${id}.json`);
  if (!metaText) return null;
  try {
    const meta = JSON.parse(metaText);
    const r = await Filesystem.readFile({ path: `${MEDIA}/${id}.bin`, directory: DIR });
    return { ...meta, data: r.data };   // base64
  } catch {
    return null;
  }
}

async function mediaAll() {
  let files = [];
  try {
    files = (await Filesystem.readdir({ path: MEDIA, directory: DIR })).files;
  } catch {
    return [];   // no media folder yet
  }
  const out = [];
  for (const f of files) {
    const name = typeof f === 'string' ? f : f.name;
    if (!name.endsWith('.json')) continue;
    const rec = await mediaGet(name.slice(0, -5));
    if (rec) out.push(rec);
  }
  return out;
}

async function clearAll() {
  for (const path of SLOTS) {
    try { await Filesystem.deleteFile({ path, directory: DIR }); } catch {}
  }
  try { await Filesystem.rmdir({ path: MEDIA, directory: DIR, recursive: true }); } catch {}
  seq = 0;
}

window.TrueNative = {
  isNative: Capacitor.isNativePlatform(),
  platform: Capacitor.getPlatform(),
  readState, writeState, clearAll,
  mediaPut, mediaGet, mediaAll,
};
