// Zero-knowledge encrypted backup store.
//
// The client encrypts everything with AES-GCM using a key derived from a
// recovery code that never leaves the device. This function stores and
// returns ciphertext it cannot read. The backup id is itself derived from
// the recovery code, so possession of the code is the only credential.
//
// There is nothing here to subpoena: no accounts, no names, no plaintext.

import { getStore } from '@netlify/blobs';

const ID_RE = /^[0-9a-f]{32}$/;
const MAX_CIPHERTEXT_CHARS = 6_000_000; // ~4.5MB binary — function payload ceiling

export default async (req) => {
  const store = getStore('true-backups');
  const url = new URL(req.url);

  if (req.method === 'POST') {
    let body;
    try {
      body = await req.json();
    } catch {
      return Response.json({ error: 'bad_request' }, { status: 400 });
    }
    const { id, iv, data } = body;
    if (!ID_RE.test(id || '') || typeof iv !== 'string' || iv.length > 64 ||
        typeof data !== 'string' || data.length === 0 || data.length > MAX_CIPHERTEXT_CHARS) {
      return Response.json({ error: 'bad_request' }, { status: 400 });
    }
    await store.setJSON(id, { iv, data, updated: Date.now() });
    return Response.json({ ok: true });
  }

  const id = url.searchParams.get('id') || '';
  if (!ID_RE.test(id)) {
    return Response.json({ error: 'bad_request' }, { status: 400 });
  }

  if (req.method === 'GET') {
    const rec = await store.get(id, { type: 'json' });
    if (!rec) return Response.json({ error: 'not_found' }, { status: 404 });
    return Response.json(rec, { headers: { 'cache-control': 'no-store' } });
  }

  if (req.method === 'DELETE') {
    await store.delete(id);
    return Response.json({ ok: true });
  }

  return new Response('Method not allowed', { status: 405 });
};
