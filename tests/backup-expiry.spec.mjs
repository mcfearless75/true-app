// Backups untouched for 7 years are deleted (DPIA 2.4). The privacy and
// support pages promise this, so it's pinned down here.

import { test, expect } from '@playwright/test';
import { EXPIRE_YEARS, isExpired, sweepExpired } from '../netlify/lib/backup-expiry.mjs';

const YEAR = 365.25 * 86400000;
const NOW = Date.UTC(2040, 0, 1);

// A stand-in for a Netlify Blobs store
function fakeStore(entries) {
  const blobs = new Map(entries);
  return {
    blobs,
    async list() { return { blobs: [...blobs.keys()].map(key => ({ key })), directories: [] }; },
    async getMetadata(key) { const b = blobs.get(key); return b ? { etag: 'x', metadata: b.metadata || {} } : null; },
    async get(key) { const b = blobs.get(key); return b ? b.rec : null; },
    async delete(key) { blobs.delete(key); },
  };
}

test('the promise is 7 years', () => {
  expect(EXPIRE_YEARS).toBe(7);
  expect(isExpired(NOW - 6.9 * YEAR, NOW)).toBe(false);
  expect(isExpired(NOW - 7.1 * YEAR, NOW)).toBe(true);
  expect(isExpired(undefined, NOW)).toBe(false);   // no date: never guess, keep it
  expect(isExpired(Date.now())).toBe(false);       // one made today has years to go
});

test('the daily sweep deletes only backups untouched for 7 years', async () => {
  const at = t => ({ rec: { iv: 'i', data: 'd', updated: t }, metadata: { updated: t } });
  const A = 'a'.repeat(32), B = 'b'.repeat(32), C = 'c'.repeat(32), D = 'd'.repeat(32);
  const store = fakeStore([
    [A, at(NOW - 1 * YEAR)],
    [B, at(NOW - 8 * YEAR)],
    // saved before metadata was added: the date is only inside the record
    [C, { rec: { iv: 'i', data: 'd', updated: NOW - 8 * YEAR } }],
    [D, { rec: { iv: 'i', data: 'd', updated: NOW - 2 * YEAR } }],
  ]);
  expect(await sweepExpired(store, NOW)).toBe(2);
  expect([...store.blobs.keys()].sort()).toEqual([A, D]);
});
