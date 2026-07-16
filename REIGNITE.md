# TRUE — Reignition Brief (July 2026)

> Reviewed and rebuilt by Claude Fable 5, 16 July 2026.
> Read this first, then CLAUDE.md for full product context.

---

## What True is (one paragraph)

True is a **completely private** self-awareness app for young people aged 10–21, built specifically for those in foster care. No adult access, no monitoring, no shared data — ever. The young person owns everything. Commercial model: B2B to local councils and fostering agencies as a therapeutic self-development tool. The privacy IS the product.

**Market position (re-verified July 2026):** still no UK product occupies this space. Mirror (Child Mind Institute) remains US-only, funded by California DHCS, generic-teen rather than foster-specific. UK foster tech (Intuitivecare etc.) is all agency/carer-facing compliance software. The gap is intact.

---

## Fable's audit — what was broken and what got fixed

The March build had three genuine bugs that would have sunk a beta:

| # | Issue | Status |
|---|-------|--------|
| 1 | **Mood colours broken.** The Ember→True rebrand script blanket-replaced orange hexes, so "Really low" rendered in brand teal — visually identical to positive UI. Mood scale lost all meaning. | ✅ FIXED — restored semantic scale: `#C94F35` (low) → `#D98E2B` → grey → green → dark green |
| 2 | **Demo data shipped to real users.** Jordan's fake moods/journals/milestones were hardcoded in initial state. Every beta tester would open the app to someone else's fake life. | ✅ FIXED — moved to `DEMO_DATA`, loads only with `?demo=1` URL param. Real users start clean, with proper empty states on Home. |
| 3 | **Milestones screen was orphaned.** The view existed but had no nav button — completely unreachable in the shipped app. | ✅ FIXED — reachable from Journey ("+ Add milestone") and Home (last-milestone card tap). |

And two roadmap items that were never done:

| # | Item | Status |
|---|------|--------|
| 4 | **Letter to Future Me** sat in a separate file, never integrated. | ✅ INTEGRATED — full feature now in index.html: write tab, prompt nudges, age pills (18/21/25, filtered above current age), seal/lock, My Letters list with locked/ready/opened states, reveal panel, appears in Journey timeline with blue accent (#1D6FA4). |
| 5 | **No PWA support** — "Add to home screen" gave a second-class shortcut. | ✅ DONE — manifest.json, sw.js (cache-first shell, versioned `true-v1`), icons (192/512/maskable). App now installs standalone with proper icon and works offline. |

### Nav restructure (7 views, 5 slots)
- **Nav:** Home · Mood · Journal · Letter · Journey
- **About Me:** tap the avatar in the header
- **Milestones:** via Journey + button, or Home milestone card

---

## Current file map

```
true-app/
├── REIGNITE.md            ← this file
├── CLAUDE.md              ← product brief, brand rules, constraints
├── index.html             ← the app (single file, all 7 views, PWA-wired)
├── beta.html              ← young-person landing page (install instructions)
├── feedback.html          ← beta feedback form (needs Formspree ID)
├── manifest.json          ← PWA manifest
├── sw.js                  ← service worker (bump CACHE version on deploy)
├── icon.svg               ← master icon
├── icon-192.png / icon-512.png / icon-maskable-512.png
└── README.md
```

`feature-future-letter.html` and `INTEGRATE-LETTER-FEATURE.md` are now **obsolete** — feature is integrated. Delete them.

---

## STEP 1 — Create the GitHub repo (no repo exists — confirmed)

Run in Claude Code from the true-app folder:

```
Create a private GitHub repo called "true-app" and push this project to it.
Use gh CLI: gh repo create true-app --private --source=. --remote=origin --push
Initialise git first if needed. Sensible .gitignore (node_modules, .DS_Store, .env).
Commit message: "True v0.2 — Fable rebuild: letter feature, PWA, demo-data fix, mood colour fix, nav restructure"
```

Keep it **private** — the code is your copyright evidence trail. Commit history = creation-date proof (relevant to the IP work from March).

## STEP 2 — Deploy

Netlify (drag folder or connect the repo) or Vercel (`vercel --prod`, account already connected to your tooling). Either gives HTTPS, which the service worker requires.

- Beta link to share: `https://<site>/beta.html`
- Demo link for council pitches: `https://<site>/index.html?demo=1` ← pre-populated Jordan account, perfect for showing stakeholders without touching real data

## STEP 3 — Wire feedback

formspree.io free tier → create form → paste ID into the commented `fetch()` in feedback.html. Five minutes.

---

## Backlog (priority order, post-deploy)

1. **Age-adaptive language** — `currentAge()` helper already exists; swap PROMPTS array by band (`10-13` simpler, `17+` deeper). ~1 hr.
2. **PIN security note** — PIN stored in plain localStorage. Fine for beta; hash it (SHA-256 via Web Crypto) before any real rollout. ~30 min.
3. **Data export** — "Download my everything" as JSON/text. Matters hugely for care leavers taking their story with them; also a GDPR right. ~1 hr.
4. **AI journalling** — reflective responses to entries via Anthropic API. Needs a serverless proxy (Netlify/Vercel function) so no key ships client-side. The privacy promise means entries must NOT be stored server-side — process and discard, and say so in-app.
5. **Capacitor wrap** — only after 10+ beta users validate the PWA. Don't pay Apple £79/yr before evidence.

## Commercial next actions (unchanged from March, still not done)

- [ ] File TRUE trade mark — note: "True" is a common word, expect a harder examination than Ember would have had; the Class 42/44 specs in the March filing guide still apply but consider a stylised/logo mark as fallback
- [ ] Register truebeta / myTrue domain
- [ ] Contact 2 fostering agency participation groups for user sessions
- [ ] One-page evidence alignment note (NICE / Working Together 2023 / Pupil Premium Plus)
- [ ] Target: Virtual School Heads, North West councils first

---

## Brand rules (unchanged — enforce these)

- Primary `#1A7A6E` (--tr) · accent `#25A99A` (--glow) · letter/blue accent `#1D6FA4` (--acc)
- Mood colours are SEMANTIC, never brand: low=`#C94F35`, poor=`#D98E2B`, ok=grey, good=green, great=dark green. **Never let a rebrand script touch them again.**
- Lowercase wordmark "true". Tagline: *Your words. Your truth.*
- Voice: warm, direct, honest. Never: share, report, track, monitor, complete, support team.
- UK English throughout.

## Testing checklist before sharing the beta link

- [ ] Fresh incognito → onboarding runs (name → age → PIN ×2) → app opens EMPTY
- [ ] `?demo=1` in fresh incognito → Jordan's populated account
- [ ] Mood check-in saves, appears in week bar + Journey
- [ ] Letter: pick age → seal → appears locked in My Letters + Journey
- [ ] Avatar tap → About Me; Journey + button → Milestones
- [ ] Lock button → PIN screen → correct PIN reopens
- [ ] Refresh → data persists (localStorage)
- [ ] Android Chrome → install prompt gives standalone app with flame icon
- [ ] Airplane mode after first load → app still opens (service worker)
