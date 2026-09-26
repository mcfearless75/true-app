# true

> Your words. Your truth.

A completely private self-awareness app for young people aged 10–21, built specifically for those in foster care. No adult access, no monitoring, no shared data — ever.

---

## Running locally

No build step. No app dependencies (only `@netlify/blobs` for the optional backup function).

```bash
npx serve .
# or
python -m http.server 8080
```

Then open `http://localhost:8080`. Serve over localhost or HTTPS so the service worker and Web Crypto are active.

Demo account for stakeholder walkthroughs: `index.html?demo=1` — loads a pre-populated example without touching real data. Do not send young people this URL.

---

## What's in the app

| Screen | What it does |
|--------|-------------|
| **Onboarding** | Name, age band, PIN setup — first run only |
| **Lock screen** | 4- or 6-digit PIN (the young person chooses; 4 is the default). Help is available without unlocking. After a correct PIN the story is decrypted into memory |
| **Home** | Greeting, mood bar, today's prompt, last milestone |
| **Mood** | 5-point check-in with optional private note |
| **Journal** | Age-adaptive rotating prompts (10–13 / 14–16 / 17+), full history |
| **Letter to Future Me** | Write to yourself, sealed until 18/21/25. Hidden from the 10–13 nav |
| **About Me** | Values, goals, stealth (“look like notes”), backup, export |
| **Milestones** | Personal milestones, optional photo and voice-note memories |
| **Journey** | Unified filterable timeline |
| **Share my week** | User-initiated, mood-only picture — never notes, journal or letters. Hidden for 10–13 |
| **Need help now** | Childline, Shout, Samaritans, Papyrus — also from the lock screen |
| **Your patterns** | On-device mood insights |
| **Take a minute** | Box breathing + 5-4-3-2-1 |
| **Vault (18+)** | Leaving-care pack (moods off unless ticked) + full JSON export |
| **Backup** | AES-256-GCM, PBKDF2, recovery code never leaves the device |

Installable as a PWA. Works offline after first load.

There is **no AI**. Journal text is never sent to a model.

---

## Privacy & security

- On-device text is stored as AES-GCM ciphertext after the first successful PIN (migrates older plaintext accounts on next unlock). Photos and voice notes remain in IndexedDB on the device.
- The PIN is never stored — only a salted SHA-256 hash. After 5 wrong tries True locks for 30s, then 1, 5 and 15 minutes for each lockout in a row; a correct code resets it.
- Locking the app drops the story from memory. Help still works.
- Optional backup is zero-knowledge ciphertext only. Backups untouched for 7 years are deleted by a daily scheduled function (`netlify/functions/backup-expiry.mjs`).
- `commissioners.html` is the buyer page: what they fund, what they will never see.

---

## Deploy

Netlify: connect this repo. HTTPS required.

- Young person: `https://<site>/beta.html`
- Council walkthrough: `https://<site>/index.html?demo=1`
- Commissioners: `https://<site>/commissioners.html`

Bump `CACHE` in `sw.js` on every deploy.

---

## Roadmap

- [x] Formspree on `feedback.html`
- [x] Leaving-care Vault + pack
- [x] Encrypt on-device state with a key derived from the PIN
- [ ] Encrypt media blobs the same way
- [ ] Capacitor.js wrapper after beta validation

---

## Brand

- **Name:** true (lowercase wordmark)
- **Primary:** `#1A7A6E` · **Accent:** `#25A99A` · **Letter blue:** `#1D6FA4`
- Mood colours are semantic, never brand
- **Tone:** warm, direct, honest. UK English.

See `CLAUDE.md`, `REBRAND.md` and `REIGNITE.md` for history. This README is the live feature list.
