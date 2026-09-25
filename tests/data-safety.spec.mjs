// The words are the product. These tests pin down the ways True has lost
// them before (both found 25 Sept 2026, both live at the time) and the
// promises the privacy page makes. If one fails, don't ship.

import { test, expect } from '@playwright/test';

const PIN = '2580';
const SECRET = 'the-thing-i-never-told-anyone';

// A stand-in for netlify/functions/backup: stores ciphertext by id.
function fakeBackupServer() {
  const store = new Map();
  return {
    store,
    async attach(page) {
      await page.route('**/.netlify/functions/backup**', async route => {
        const req = route.request();
        const id = new URL(req.url()).searchParams.get('id');
        if (req.method() === 'POST') {
          const body = JSON.parse(req.postData());
          store.set(body.id, { iv: body.iv, data: body.data, updated: Date.now() });
          return route.fulfill({ json: { ok: true } });
        }
        if (req.method() === 'DELETE') { store.delete(id); return route.fulfill({ json: { ok: true } }); }
        const rec = store.get(id);
        return rec ? route.fulfill({ json: rec }) : route.fulfill({ status: 404, json: { error: 'not_found' } });
      });
    },
  };
}

// A set-up account, as if onboarding had just finished
async function newAccount(page, { backup = false } = {}) {
  await page.goto('/index.html');
  await page.evaluate(async ({ PIN, SECRET }) => {
    S.name = 'Sam'; S.age = '14-16';
    S.journals = [{ d: '1 Sep', p: 'x', t: SECRET, ts: Date.now() }];
    await setPin(PIN);
    finishOnboarding();
  }, { PIN, SECRET });
  if (backup) {
    await page.evaluate(async () => {
      enableBackup();
      // wait for the PIN to be sealed with the recovery code
      for (let i = 0; i < 100 && !S.pinRescue; i++) await new Promise(r => setTimeout(r, 100));
      document.getElementById('code-overlay').classList.remove('open');
      await doBackup(true);
    });
  }
  return page.evaluate(() => S.backupCode);
}

async function typeOn(page, pad, digits) {
  for (const d of digits) await page.locator(`${pad} .pin-key`, { hasText: new RegExp(`^${d}$`) }).click();
}

// New code, entered twice — the pad switches to "again" after a beat
async function chooseCode(page, pad, hint, digits) {
  await typeOn(page, pad, digits);
  await expect(page.locator(hint)).toContainText('again');
  await typeOn(page, pad, digits);
}

const unlockedStory = page => page.evaluate(() =>
  document.getElementById('lock-screen').classList.contains('hidden') ? (S.journals[0] || {}).t : null);

const saved = page => page.evaluate(() => JSON.parse(localStorage.getItem('true_state')));

const PHOTO = 'PHOTO-BYTES-of-my-first-day-at-college';

// A photo in the memory box, the way saveMilestone stores one
const addPhoto = page => page.evaluate(async PHOTO => {
  await mediaPut({ id: 'ph_1', kind: 'photo', type: 'image/png', blob: new Blob([PHOTO], { type: 'image/png' }) });
}, PHOTO);

// What the app can read (null when it can't open it)
const readPhoto = page => page.evaluate(async () => {
  const r = await mediaGet('ph_1');
  return r ? r.blob.text() : null;
});

// What's actually sitting in storage
const storedPhoto = page => page.evaluate(async () => {
  const r = await mediaGetRaw('ph_1');
  return r && { enc: !!r.enc, text: await r.blob.text() };
});

// ─────────────────────────────────────────────────────────────────────

test('first run: onboarding through the real screens', async ({ page }) => {
  await page.goto('/index.html');
  await page.getByRole('button', { name: 'Get started' }).click();
  await page.locator('#ob-name').fill('Sam');
  await page.getByRole('button', { name: "That's me" }).click();
  await page.locator('#age-opts .mood-row', { hasText: '14 – 16' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await chooseCode(page, '#ob-4', '#ob-pin-hint', PIN);
  await expect(page.locator('#home-greeting')).toHaveText('Hey Sam.');
  expect((await saved(page)).data).toBeTruthy();   // encrypted from the start
});

test('Lock then unlock keeps the story (bug: it came back empty and got saved that way)', async ({ page }) => {
  await newAccount(page);
  await page.locator('#header .lock-btn').click();
  await typeOn(page, '#lock-screen', PIN);
  await expect.poll(() => unlockedStory(page)).toBe(SECRET);

  await page.reload();
  await typeOn(page, '#lock-screen', PIN);
  await expect.poll(() => unlockedStory(page)).toBe(SECRET);
});

test('a mistyped code never wipes the saved story (bug: one typo, then closing True, lost everything)', async ({ page }) => {
  await newAccount(page);
  await page.locator('#header .lock-btn').click();
  await page.reload();

  await typeOn(page, '#lock-screen', '9999');
  await expect(page.locator('#lock-hint')).toContainText('Incorrect');
  await typeOn(page, '#lock-screen', '1111');
  expect((await saved(page)).data).toBeTruthy();

  await page.reload();   // they close the app after the typos
  await typeOn(page, '#lock-screen', PIN);
  await expect.poll(() => unlockedStory(page)).toBe(SECRET);
});

test('nothing readable is saved on the phone', async ({ page }) => {
  const server = fakeBackupServer();
  await server.attach(page);
  const code = await newAccount(page, { backup: true });
  const raw = await page.evaluate(() => localStorage.getItem('true_state'));
  expect(raw).not.toContain(SECRET);
  expect(raw).not.toContain('Sep');     // entry dates live inside the ciphertext too
  expect(raw).not.toContain(code);
  expect(raw.replace(/-/g, '')).not.toContain(code.replace(/-/g, ''));
  // and the backup server only ever sees ciphertext
  for (const rec of server.store.values()) expect(JSON.stringify(rec)).not.toContain(SECRET);
});

test('forgot code: the recovery code opens it offline, nothing lost, old code dead', async ({ page }) => {
  const server = fakeBackupServer();
  await server.attach(page);
  const code = await newAccount(page, { backup: true });
  await page.locator('#header .lock-btn').click();
  await page.reload();
  await server.attach(page);
  let fetched = 0;
  page.on('request', r => { if (r.url().includes('/functions/backup')) fetched++; });

  await page.getByRole('button', { name: 'Forgot your code?' }).click();
  await page.locator('#fg-code-input').fill(code.toLowerCase());
  await page.locator('#fg-code-btn').click();
  await expect(page.locator('#fg-pin')).toBeVisible({ timeout: 30_000 });
  await chooseCode(page, '#fg-pin', '#fg-pin-hint', '4444');
  await expect.poll(() => unlockedStory(page), { timeout: 30_000 }).toBe(SECRET);
  expect(fetched).toBe(0);   // the sealed PIN did it, on the phone

  await page.reload();
  await typeOn(page, '#lock-screen', PIN);
  await expect(page.locator('#lock-hint')).toContainText('Incorrect');
  await typeOn(page, '#lock-screen', '4444');
  await expect.poll(() => unlockedStory(page)).toBe(SECRET);
});

test('forgot code: a wrong recovery code is refused', async ({ page }) => {
  const server = fakeBackupServer();
  await server.attach(page);
  await newAccount(page, { backup: true });
  await page.locator('#header .lock-btn').click();
  await page.getByRole('button', { name: 'Forgot your code?' }).click();
  await page.locator('#fg-code-input').fill('AAAA-BBBB-CCCC-DDDD-EEEE');
  await page.locator('#fg-code-btn').click();
  await expect(page.locator('#fg-code-msg')).toContainText("doesn't match", { timeout: 30_000 });
  await expect(page.locator('#fg-pin')).toBeHidden();
});

test('new phone: restore brings the story back and asks for a new code', async ({ page, browser }) => {
  const server = fakeBackupServer();
  await server.attach(page);
  const code = await newAccount(page, { backup: true });
  expect(server.store.size).toBe(1);

  const phone2 = await (await browser.newContext({ serviceWorkers: 'block' })).newPage();
  await server.attach(phone2);
  await phone2.goto('/index.html');
  await phone2.getByRole('button', { name: /I had True before/ }).click();
  await phone2.locator('#restore-code').fill(code);
  await phone2.locator('#restore-btn').click();
  await expect(phone2.locator('#fg-pin-title')).toHaveText('Welcome back', { timeout: 30_000 });
  const reloaded = phone2.waitForEvent('load', { timeout: 30_000 });
  await chooseCode(phone2, '#fg-pin', '#fg-pin-hint', '7777');
  await reloaded;
  await expect(phone2.locator('#lock-screen')).toBeVisible();

  await typeOn(phone2, '#lock-screen', PIN);   // the old code doesn't come with it
  await expect(phone2.locator('#lock-hint')).toContainText('Incorrect');
  await typeOn(phone2, '#lock-screen', '7777');
  await expect.poll(() => unlockedStory(phone2)).toBe(SECRET);
});

test('photos and voice notes are encrypted on the phone, and locked when True is', async ({ page }) => {
  await newAccount(page);
  await addPhoto(page);
  const stored = await storedPhoto(page);
  expect(stored.enc).toBe(true);
  expect(stored.text).not.toContain(PHOTO);
  expect(await readPhoto(page)).toBe(PHOTO);

  await page.locator('#header .lock-btn').click();
  expect(await readPhoto(page)).toBeNull();   // locked: can't be opened

  await page.reload();
  await typeOn(page, '#lock-screen', PIN);
  await expect.poll(() => unlockedStory(page)).toBe(SECRET);
  expect(await readPhoto(page)).toBe(PHOTO);
});

test('photos saved before encryption get sealed on the next unlock', async ({ page }) => {
  await newAccount(page);
  await page.evaluate(async PHOTO => {   // how the old version stored them
    await mediaPutRaw({ id: 'ph_1', kind: 'photo', type: 'image/png', blob: new Blob([PHOTO], { type: 'image/png' }) });
  }, PHOTO);
  expect((await storedPhoto(page)).enc).toBe(false);

  await page.locator('#header .lock-btn').click();
  await page.reload();
  await typeOn(page, '#lock-screen', PIN);
  await expect.poll(async () => (await storedPhoto(page)).enc).toBe(true);
  expect((await storedPhoto(page)).text).not.toContain(PHOTO);
  expect(await readPhoto(page)).toBe(PHOTO);
});

test('forgot code: photos still open after choosing a new code', async ({ page }) => {
  const server = fakeBackupServer();
  await server.attach(page);
  const code = await newAccount(page, { backup: true });
  await addPhoto(page);
  await page.locator('#header .lock-btn').click();
  await page.reload();
  await server.attach(page);

  await page.getByRole('button', { name: 'Forgot your code?' }).click();
  await page.locator('#fg-code-input').fill(code);
  await page.locator('#fg-code-btn').click();
  await expect(page.locator('#fg-pin')).toBeVisible({ timeout: 30_000 });
  await chooseCode(page, '#fg-pin', '#fg-pin-hint', '4444');
  await expect.poll(() => unlockedStory(page), { timeout: 30_000 }).toBe(SECRET);
  expect(await readPhoto(page)).toBe(PHOTO);

  await page.reload();
  await typeOn(page, '#lock-screen', '4444');
  await expect.poll(() => unlockedStory(page)).toBe(SECRET);
  expect(await readPhoto(page)).toBe(PHOTO);
});

test('new phone: photos come back from the backup, encrypted again', async ({ page, browser }) => {
  const server = fakeBackupServer();
  await server.attach(page);
  const code = await newAccount(page, { backup: true });
  await addPhoto(page);
  await page.evaluate(() => doBackup(true));
  for (const rec of server.store.values()) expect(JSON.stringify(rec)).not.toContain(PHOTO);

  const phone2 = await (await browser.newContext({ serviceWorkers: 'block' })).newPage();
  await server.attach(phone2);
  await phone2.goto('/index.html');
  await phone2.getByRole('button', { name: /I had True before/ }).click();
  await phone2.locator('#restore-code').fill(code);
  await phone2.locator('#restore-btn').click();
  await expect(phone2.locator('#fg-pin-title')).toHaveText('Welcome back', { timeout: 30_000 });
  const reloaded = phone2.waitForEvent('load', { timeout: 30_000 });
  await chooseCode(phone2, '#fg-pin', '#fg-pin-hint', '7777');
  await reloaded;
  await typeOn(phone2, '#lock-screen', '7777');
  await expect.poll(() => unlockedStory(phone2)).toBe(SECRET);

  const stored = await storedPhoto(phone2);
  expect(stored.enc).toBe(true);
  expect(stored.text).not.toContain(PHOTO);
  expect(await readPhoto(phone2)).toBe(PHOTO);
});

test('after a restart the lock screen greets them by name, unless True looks like notes', async ({ page }) => {
  await newAccount(page);
  await page.locator('#header .lock-btn').click();
  await page.reload();
  await expect(page.locator('#lock-hint')).toHaveText('Welcome back, Sam — enter your code');

  await typeOn(page, '#lock-screen', PIN);
  await expect.poll(() => unlockedStory(page)).toBe(SECRET);
  await page.evaluate(() => toggleStealth());
  await page.locator('#header .lock-btn').click();
  await page.reload();
  await expect(page.locator('#lock-hint')).toHaveText('Enter your code');
  expect(JSON.stringify(await saved(page))).not.toContain('Sam');
});

test('a new recovery code locks out the old one, and the new one works everywhere', async ({ page }) => {
  const server = fakeBackupServer();
  await server.attach(page);
  const oldCode = await newAccount(page, { backup: true });
  page.on('dialog', d => d.accept());
  await page.evaluate(() => replaceBackupCode());
  const newCode = await page.evaluate(() => S.backupCode);
  expect(newCode).not.toBe(oldCode);
  await expect(page.locator('#code-display')).toHaveText(newCode);
  expect(server.store.size).toBe(1);   // old copy deleted, new one there

  // the old code opens nothing, on any phone
  const restoreWith = async code => page.evaluate(async code => {
    try { await fetchBackup(code); return 'opened'; } catch (e) { return e.message; }
  }, code);
  expect(await restoreWith(oldCode)).toBe('notfound');
  expect(await restoreWith(newCode)).toBe('opened');

  // and "Forgot your code?" takes the new one, offline
  await page.evaluate(() => document.getElementById('code-overlay').classList.remove('open'));
  await page.locator('#header .lock-btn').click();
  await page.reload();
  await server.attach(page);
  await page.getByRole('button', { name: 'Forgot your code?' }).click();
  await page.locator('#fg-code-input').fill(newCode);
  await page.locator('#fg-code-btn').click();
  await expect(page.locator('#fg-pin')).toBeVisible({ timeout: 30_000 });
});

test('if the new code can\'t be backed up, nothing changes', async ({ page }) => {
  const server = fakeBackupServer();
  await server.attach(page);
  const oldCode = await newAccount(page, { backup: true });
  await page.route('**/.netlify/functions/backup**', r =>
    r.request().method() === 'POST' ? r.fulfill({ status: 500 }) : r.fallback());
  page.on('dialog', d => d.accept());
  await page.evaluate(() => replaceBackupCode());
  expect(await page.evaluate(() => S.backupCode)).toBe(oldCode);
  expect(server.store.size).toBe(1);   // the old copy is still there
});

test('turning backup off deletes the online copy', async ({ page }) => {
  const server = fakeBackupServer();
  await server.attach(page);
  await newAccount(page, { backup: true });
  expect(server.store.size).toBe(1);
  page.on('dialog', d => d.accept());
  await page.evaluate(() => disableBackup());
  expect(server.store.size).toBe(0);
  expect((await saved(page)).pinRescue).toBeFalsy();
});
