// Backups nobody has touched in 7 years are deleted. True backs up by itself
// whenever it's used with backup on, so "untouched" means the app hasn't
// been opened and changed in all that time. 7 years is long enough for a
// care leaver to come back for their story, and it means we don't hold
// even unreadable copies for ever (UK GDPR storage limitation). The privacy
// and support pages say the same — change them together.

export const EXPIRE_YEARS = 7;
export const EXPIRE_MS = EXPIRE_YEARS * 365.25 * 86400000;

export const isExpired = (updated, now = Date.now()) =>
  typeof updated === 'number' && updated > 0 && now - updated > EXPIRE_MS;

// When a backup was last written. Newer backups carry it as blob metadata so
// the sweep doesn't download megabytes to read one number; older ones only
// have it inside the record.
async function lastUpdated(store, key) {
  const meta = await store.getMetadata(key);
  if (!meta) return null;
  const t = meta.metadata && Number(meta.metadata.updated);
  if (t) return t;
  const rec = await store.get(key, { type: 'json' });
  return rec ? rec.updated : null;
}

// Deletes every expired backup in the store. Returns how many went.
export async function sweepExpired(store, now = Date.now()) {
  const { blobs } = await store.list();
  let deleted = 0;
  for (const { key } of blobs) {
    try {
      if (isExpired(await lastUpdated(store, key), now)) {
        await store.delete(key);
        deleted++;
      }
    } catch (e) {
      // one unreadable blob mustn't stop the rest; the next run tries again
    }
  }
  return deleted;
}
