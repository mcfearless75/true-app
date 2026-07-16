# true

> Your words. Your truth.

A completely private self-awareness app for young people aged 10–21, built specifically for those in foster care. No adult access, no monitoring, no shared data — ever.

---

## Running locally

No build step. No dependencies.

```bash
npx serve .
# or
python -m http.server 8080
```

Then open `http://localhost:8080`. (Serve over localhost/HTTPS so the service worker and Web Crypto PIN hashing are active.)

Demo account for stakeholder walkthroughs: `index.html?demo=1` — loads a pre-populated example without touching real data.

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
| **Milestones** | Add and view personal milestones by category |
| **Journey** | Unified filterable timeline of everything |
| **Share my week** | User-initiated, mood-only summary — never notes, journal or letters |
| **Need help now** | Static signposting (Childline, Shout, Samaritans, Papyrus) — no tracking |

Installable as a PWA (manifest + service worker, works offline after first load).

---

## Privacy & security

- All data lives in `localStorage` on the device. No API calls, no analytics, no server.
- The PIN is never stored — only a per-device salted SHA-256 hash.
- Repeated wrong PIN attempts trigger a 30-second lockout.
- **Download my everything** (About Me) exports the user's full story as JSON — a GDPR right, and continuity for care leavers.
- Security headers (CSP, HSTS, no-referrer, frame-deny) set via `netlify.toml`.
- UK GDPR / ICO Children's Code by design: no data ever leaves the device.

---

## Deploy

Netlify: drag the folder to the dashboard, or connect this repo. HTTPS comes free (required for the service worker and Web Crypto).

- Beta link: `https://<site>/beta.html`
- Council demo: `https://<site>/index.html?demo=1`

Bump `CACHE` in `sw.js` on every deploy.

---

## Roadmap

- [ ] Formspree ID into `feedback.html`
- [ ] AI journalling via Anthropic API (serverless proxy — entries processed and discarded, never stored)
- [ ] Capacitor.js wrapper for iOS/Android (after beta validation)

---

## Brand

- **Name:** true (lowercase wordmark)
- **Primary:** `#1A7A6E` · **Accent:** `#25A99A` · **Letter blue:** `#1D6FA4`
- Mood colours are semantic, never brand — do not let a rebrand script touch them
- **Tone:** warm, direct, honest — never clinical. UK English.

See `CLAUDE.md` and `REIGNITE.md` for full product context.
