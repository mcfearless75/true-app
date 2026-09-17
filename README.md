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

Then open `http://localhost:8080`. Serve over localhost or HTTPS so the service worker and Web Crypto PIN hashing are active.

Demo account for stakeholder walkthroughs: `index.html?demo=1` — loads a pre-populated example without touching real data. Do not send young people this URL.

---

## What's in the app

| Screen | What it does |
|--------|-------------|
| **Onboarding** | Name, age band, PIN setup — first run only |
| **Lock screen** | 4-digit PIN, salted SHA-256 hashed, 30s lockout after 5 wrong tries |
| **Home** | Greeting, mood bar (this week), today's prompt, last milestone |
| **Mood** | 5-point check-in with optional private note |
| **Journal** | Age-adaptive rotating prompts (10–13 / 14–16 / 17+), full history |
| **Letter to Future Me** | Write to yourself, sealed until a chosen age (18/21/25) |
| **About Me** | Values, goals, self-knowledge note, data export |
| **Milestones** | Personal milestones by category, with optional photo and voice-note memories (memory box) |
| **Journey** | Unified filterable timeline of everything |
| **Share my week** | User-initiated, mood-only summary — never notes, journal or letters |
| **Need help now** | Static signposting (Childline, Shout, Samaritans, Papyrus) — no tracking |
| **Your patterns** | On-device mood insights: streak, week trend, best day (Journey) |
| **Take a minute** | Calm space: box breathing + 5-4-3-2-1 grounding, offered on low check-ins |
| **Vault (18+)** | Opt-in life record and on-device story export for care leavers |
| **Backup** | Zero-knowledge encrypted backup: AES-256-GCM, key derived (PBKDF2-600k) from a recovery code that never leaves the device. Server stores unreadable ciphertext. Restore anywhere with the code |

Installable as a PWA (manifest + service worker, works offline after first load).

There is **no AI**. An on-device reflection feature was built and cut in July 2026 after it misread how care-experienced young people write. Journal text is never sent to a model. See `docs/superpowers/specs/2026-07-17-on-device-ai-design.md`.

---

## Privacy & security

- Text lives in `localStorage`, photos and voice notes in IndexedDB. The only optional network write is encrypted backup ciphertext, and only if the user turns backup on.
- The PIN is never stored — only a per-device salted SHA-256 hash. The PIN hides the UI; it does not encrypt the on-device store.
- Repeated wrong PIN attempts trigger a 30-second lockout.
- **Download my everything** (About Me / Vault) exports the user's full story as HTML and JSON — a GDPR right, and continuity for care leavers.
- Optional backup is zero-knowledge: encrypted on-device, the server holds only ciphertext filed under an id derived from the recovery code. No accounts, no names, nothing readable to hand over.
- Security headers (CSP, HSTS, no-referrer, frame-deny) set via `netlify.toml`.
- Feedback about the *app* (never journal content) can be sent from `feedback.html`. That is separate from a young person's story.
- UK GDPR / ICO Children's Code by design: no adult logins, no analytics, no monitoring features.

---

## Deploy

Netlify: connect this repo or drag the folder to the dashboard. HTTPS comes free (required for the service worker and Web Crypto).

- Beta link: `https://<site>/beta.html`
- Council demo: `https://<site>/index.html?demo=1`

Bump `CACHE` in `sw.js` on every deploy.

---

## Roadmap

- [x] Formspree on `feedback.html`
- [x] Leaving-care Vault + story export (18+)
- [ ] Encrypt on-device state with a key derived from the PIN
- [ ] Capacitor.js wrapper for iOS/Android (after beta validation)

---

## Brand

- **Name:** true (lowercase wordmark)
- **Primary:** `#1A7A6E` · **Accent:** `#25A99A` · **Letter blue:** `#1D6FA4`
- Mood colours are semantic, never brand — do not let a rebrand script touch them
- **Tone:** warm, direct, honest — never clinical. UK English.

See `CLAUDE.md`, `REBRAND.md` and `REIGNITE.md` for product context. Treat `REIGNITE.md` as a July 2026 snapshot; this README is the live feature list.
