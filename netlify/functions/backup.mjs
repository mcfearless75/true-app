// Zero-knowledge encrypted backup store.
//
// The client encrypts everything with AES-GCM using a key derived from a
// recovery code that never leaves the device. This function stores and
// returns ciphertext it cannot read. The backup id is itself derived from
// the recovery code, so possession of the code is the only credential.
//
// There is nothing here to subpoena: no accounts, no names, no plaintext.
// Backups untouched for 7 years expire (netlify/lib/backup-expiry.mjs).

import { getStore } from '@netlify/blobs';
import { isExpired } from '../lib/backup-expiry.mjs';

const ID_RE = /^[0-9a-f]{32}$/;
const MAX_CIPHERTEXT_CHARS = 6_000_000; // ~4.5MB binary — function payload ceiling

// The installed app (Capacitor) isn't served from this site, so its calls
// are cross-origin. Only the app's own origins are let in — iOS serves from
// capacitor://localhost, Android from https://localhost. There are no
// cookies or accounts here, so CORS guards nothing secret; it just keeps
// other websites from using this as their storage.
const APP_ORIGINS = new Set(['capacitor://localhost', 'https://localhost', 'http://localhost']);

function corsHeaders(req) {
  const origin = req.headers.get('origin');
  if (!origin || !APP_ORIGINS.has(origin)) return {};
  return {
    'access-control-allow-origin': origin,
    'access-control-allow-methods': 'GET, POST, DELETE, OPTIONS',
    'access-control-allow-headers': 'content-type',
    'access-control-max-age': '86400',
    vary: 'origin',
  };
}

export default async (req) => {
  const cors = corsHeaders(req);
  const json = (body, init = {}) =>
    Response.json(body, { ...init, headers: { ...cors, ...(init.headers || {}) } });

  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });

  const store = getStore('true-backups');
  const url = new URL(req.url);

  if (req.method === 'POST') {
    let body;
    try {
      body = await req.json();
    } catch {
      return json({ error: 'bad_request' }, { status: 400 });
    }
    const { id, iv, data } = body;
    if (!ID_RE.test(id || '') || typeof iv !== 'string' || iv.length > 64 ||
        typeof data !== 'string' || data.length === 0 || data.length > MAX_CIPHERTEXT_CHARS) {
      return json({ error: 'bad_request' }, { status: 400 });
    }
    const updated = Date.now();
    await store.setJSON(id, { iv, data, updated }, { metadata: { updated } });
    return json({ ok: true });
  }

  const id = url.searchParams.get('id') || '';
  if (!ID_RE.test(id)) {
    return json({ error: 'bad_request' }, { status: 400 });
  }

  if (req.method === 'GET') {
    const rec = await store.get(id, { type: 'json' });
    // Past its 7 years but not swept yet: gone is gone, whichever runs first
    if (rec && isExpired(rec.updated)) await store.delete(id);
    if (!rec || isExpired(rec.updated)) return json({ error: 'not_found' }, { status: 404 });
    return json(rec, { headers: { 'cache-control': 'no-store' } });
  }

  if (req.method === 'DELETE') {
    await store.delete(id);
    return json({ ok: true });
  }

  return new Response('Method not allowed', { status: 405, headers: cors });
};
