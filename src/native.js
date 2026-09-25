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
import { NativeBiometric, AccessControl, BiometryType, BiometricAuthError } from '@capgo/capacitor-native-biometric';
import { LocalNotifications } from '@capacitor/local-notifications';

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
// enc/iv: set when the bytes are encrypted (index.html does the crypto)
async function mediaPut({ id, kind, type, enc, iv, data }) {
  await Filesystem.writeFile({ path: `${MEDIA}/${id}.bin`, directory: DIR, data, recursive: true });
  await Filesystem.writeFile({
    path: `${MEDIA}/${id}.json`, directory: DIR, encoding: Encoding.UTF8,
    data: JSON.stringify({ id, kind, type, enc: enc || 0, iv: iv || '' }), recursive: true,
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

// ─── Face ID / fingerprint ─────────────────────────────────────
// The story's key comes from the PIN, so biometrics have to hand the PIN
// back. It sits in the Keychain / Android Keystore with BIOMETRY_CURRENT_SET:
// the secure hardware only releases it after a face or finger match, and
// wipes it if anyone enrols a new face or finger. In foster care that
// matters — a carer adding their fingerprint must not inherit a way in.
const PIN_KEY = 'true_pin';

function bioLabel(type) {
  switch (type) {
    case BiometryType.FACE_ID: return 'Face ID';
    case BiometryType.TOUCH_ID: return 'Touch ID';
    case BiometryType.FINGERPRINT: return 'fingerprint';
    case BiometryType.FACE_AUTHENTICATION: return 'face unlock';
    case BiometryType.MULTIPLE: return 'face or fingerprint';
    default: return 'fingerprint';
  }
}

async function bioAvailable() {
  try {
    const r = await NativeBiometric.isAvailable({ useFallback: false });
    return { available: !!r.isAvailable && !!r.strongBiometryIsAvailable, label: bioLabel(r.biometryType) };
  } catch {
    return { available: false, label: '' };
  }
}

async function bioEnable(pin) {
  await NativeBiometric.setData({
    key: PIN_KEY, value: pin,
    accessControl: AccessControl.BIOMETRY_CURRENT_SET,
    title: 'Turn on quick unlock', negativeButtonText: 'Not now',
  });
}

// → { pin } on a match; { gone: true } when the phone wiped it because a
// face/finger was added (or it never existed); {} for cancel/lockout/other
async function bioGetPin(label) {
  try {
    const r = await NativeBiometric.getSecureData({
      key: PIN_KEY, reason: 'Open True', title: 'Open True',
      subtitle: `Use ${label}`, negativeButtonText: 'Use my code',
    });
    return r.value ? { pin: r.value } : {};
  } catch (e) {
    if (String(e && e.code) === String(BiometricAuthError.NO_PROTECTED_CREDENTIALS_FOUND)) return { gone: true };
    return {};
  }
}

async function bioDisable() {
  try { await NativeBiometric.deleteData({ key: PIN_KEY }); } catch {}
}

// ─── Daily check-in nudge ──────────────────────────────────────
// One repeating local notification. Scheduled on the phone — no push
// server, nothing leaves the device.
const NUDGE_ID = 7001;

async function nudgeSchedule(hour, minute, title, body) {
  let perm = await LocalNotifications.checkPermissions();
  if (perm.display !== 'granted') perm = await LocalNotifications.requestPermissions();
  if (perm.display !== 'granted') return false;
  await LocalNotifications.cancel({ notifications: [{ id: NUDGE_ID }] });
  await LocalNotifications.schedule({
    notifications: [{
      id: NUDGE_ID, title, body,
      schedule: { on: { hour, minute }, allowWhileIdle: true },
      // A nudge can be a few minutes late. Exact alarms would send them to
      // an "Alarms & reminders" settings screen, and Play restricts that
      // permission to alarm/calendar apps.
      isExactNotification: false,
      smallIcon: 'ic_stat_true',
    }],
  });
  return true;
}

async function nudgeCancel() {
  try { await LocalNotifications.cancel({ notifications: [{ id: NUDGE_ID }] }); } catch {}
}

async function clearEverything() {
  await clearAll();
  await bioDisable();
  await nudgeCancel();
}

window.TrueNative = {
  isNative: Capacitor.isNativePlatform(),
  platform: Capacitor.getPlatform(),
  readState, writeState, clearAll: clearEverything,
  mediaPut, mediaGet, mediaAll,
  bioAvailable, bioEnable, bioGetPin, bioDisable,
  nudgeSchedule, nudgeCancel,
};
