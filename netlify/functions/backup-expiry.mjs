// Once a day: delete backups nobody has touched in 7 years.
// See netlify/lib/backup-expiry.mjs for why 7.

import { getStore } from '@netlify/blobs';
import { sweepExpired } from '../lib/backup-expiry.mjs';

export default async () => {
  const deleted = await sweepExpired(getStore('true-backups'));
  console.log(`backup-expiry: deleted ${deleted}`);   // a count, never an id
};

export const config = { schedule: '@daily' };
