// WCAG 2.2 AA checks (axe-core) on every main screen and public page.
// Councils are public bodies with accessibility duties, and young people
// read True on small screens, outdoors, tired. A new low-contrast colour or
// an unlabelled button fails here.

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

async function audit(page) {
  const r = await new AxeBuilder({ page }).withTags(TAGS).analyze();
  return r.violations.map(v => `${v.id} (${v.impact}): ${v.nodes.slice(0, 3).map(n => n.target.join(' ')).join(' | ')}`);
}

const SCREENS = [
  ['lock screen',   () => {}],
  ['home',          () => showView('home')],
  ['mood',          () => showView('mood')],
  ['journal',       () => showView('journal')],
  ['letter',        () => showView('letter')],
  ['journey',       () => showView('journey')],
  ['about me',      () => showView('me')],
  ['help',          () => { showView('home'); openHelp(); }],
  ['take a minute', () => { document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open')); openCalm(); }],
];

test('first-run screen has no WCAG AA violations', async ({ page }) => {
  await page.goto('/index.html');
  expect(await audit(page)).toEqual([]);
});

test('choosing a code, 4 or 6 digits, has no WCAG AA violations', async ({ page }) => {
  await page.goto('/index.html');
  await page.evaluate(() => obNext(4));
  expect(await audit(page)).toEqual([]);
  await page.getByRole('button', { name: 'Use 6 digits instead' }).click();
  await expect(page.locator('#ob-dots')).toHaveAttribute('aria-label', '0 of 6 digits entered');
  expect(await audit(page)).toEqual([]);
});

test('every app screen has no WCAG AA violations', async ({ page }) => {
  await page.goto('/index.html?demo=1');
  const found = [];
  for (const [name, go] of SCREENS) {
    if (name === 'home') {   // unlock the demo account first
      for (const d of '1234') await page.locator('#lock-screen .pin-key', { hasText: new RegExp(`^${d}$`) }).click();
      await expect(page.locator('#lock-screen')).toBeHidden({ timeout: 15_000 });
    }
    await page.evaluate(go);
    await page.waitForTimeout(300);
    for (const v of await audit(page)) found.push(`${name}: ${v}`);
  }
  expect(found).toEqual([]);
});

for (const pageName of ['beta.html', 'support.html', 'commissioners.html', 'feedback.html']) {
  test(`${pageName} has no WCAG AA violations`, async ({ page }) => {
    await page.goto('/' + pageName);
    expect(await audit(page)).toEqual([]);
  });
}

for (const pageName of ['beta.html', 'feedback.html', 'index.html']) {
  test(`${pageName} in dark mode has no WCAG AA violations`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/' + pageName);
    expect(await audit(page)).toEqual([]);
  });
}

test('the keypad tells a screen reader what is happening', async ({ page }) => {
  await page.goto('/index.html?demo=1');
  await expect(page.getByRole('button', { name: 'Delete last digit' })).toBeVisible();
  const dots = page.locator('#lock-dots');
  await expect(dots).toHaveAttribute('aria-label', '0 of 4 digits entered');
  await page.locator('#lock-screen .pin-key', { hasText: /^9$/ }).click();
  await page.locator('#lock-screen .pin-key', { hasText: /^9$/ }).click();
  await expect(dots).toHaveAttribute('aria-label', '2 of 4 digits entered');
  await expect(page.locator('#lock-hint')).toHaveAttribute('aria-live', 'polite');
});
