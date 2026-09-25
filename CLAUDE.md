# True — Project Brief for Claude Code

## What is True?

True is a private, personal self-awareness app for young people aged 10–21, with a specific focus on those in foster care. It is **not** a monitoring or reporting tool — it is entirely private to the user. No adult access. No shared data. No oversight features.

The commercial model is B2B: sold to local councils and fostering agencies as a therapeutic self-development tool that improves emotional literacy and long-term outcomes for looked-after children.

## Brand

- **Name:** True
- **Tagline:** Your words. Your truth.
- **Tone:** Warm, direct, honest. Like a wise friend, not a clinician.
- **Primary colour:** `#1A7A6E` (True teal) — CSS var: `--tr`
- **Accent:** `#25A99A` — CSS var: `--glow`
- **Light tint:** `#E6F5F4` — CSS var: `--trlt`
- **Dark shade:** `#0F5349` — CSS var: `--trdark`
- **Logo:** Flame SVG mark (teal) + lowercase wordmark "true"
- **Previous name:** Ember (orange #D85A30). If you see --em or orange refs, replace with --tr / #1A7A6E

## File Structure

```
true-app/
├── CLAUDE.md                     ← this file
├── index.html                    ← the whole app (web + inside the native apps)
├── beta.html · feedback.html     ← beta landing page · feedback form (Formspree)
├── commissioners.html            ← for councils / fostering agencies
├── support.html                  ← App Store support URL
├── privacy.html                  ← DRAFT, not committed until the [[…]] details are filled in
├── sw.js · manifest.json         ← PWA (bump CACHE in sw.js when index.html changes)
├── netlify/functions/backup.mjs  ← zero-knowledge encrypted backup store (+ CORS for the apps)
├── src/native.js                 ← app-only: private-folder storage, Face ID, reminders
├── scripts/                      ← build-www, release-android, make-app-assets, make-store-assets
├── android/ · ios/               ← Capacitor 8 projects (appId uk.co.trueapp.app)
├── codemagic.yaml                ← cloud builds: ios-testflight, android-internal
├── store/                        ← Play + App Store listings, screenshots, raw captures
├── tests/                        ← Playwright data-safety tests (npm test)
└── docs/                         ← Codemagic setup guides, design specs
```

## Current Features (index.html)

- PIN lock + onboarding; state encrypted with a key from the PIN (AES-GCM/PBKDF2)
- Forgot-code recovery: PIN sealed with the backup recovery code (`pinRescue`)
- Home, mood check-in, journal, letters to future self, milestones + memory box
  (photos, voice notes), journey timeline, About Me
- Age split (10–13 vs older): `isYounger()`, `applyAgeCopy()`, `applyNavForAge()`
- Optional end-to-end encrypted backup + restore on a new phone
- "Download my everything" export, "Share my week" (moods only)
- Take a minute (breathing), helplines reachable from the lock screen
- "Look like notes" disguise
- App only: private-folder storage (LibraryNoCloud, allowBackup=false),
  Face ID / fingerprint unlock (Keychain/Keystore, BIOMETRY_CURRENT_SET),
  daily local-notification nudge

## Status (September 2026)

DONE: everything in the old roadmap (age-adaptive UI, PIN hashing → full
encryption, export, Formspree) plus the Capacitor apps, icons, splash,
release signing, both store listings and Codemagic workflows.

WAITING ON THE OWNER: company name / address / ICO number for privacy.html;
Apple Developer + Play Console accounts; the setup in docs/codemagic-*.md;
first test on real phones.

## Next (priority order)

1. Real-device testing of the apps (checklist in docs/codemagic-ios.md)
2. TestFlight + Play internal testing with beta young people
3. ~~AI journalling~~ **CUT July 2026 — do not rebuild without new evidence.** Tried on-device WebLLM (Llama 3.2 1B). It worked technically but a 1B model cannot read the understatement care-experienced young people write in: it called a fourth placement move "kind of funny", read a child masking to get rid of a social worker as them "being supportive" of her, and wrote about a girl whose mum cancelled contact in the third person, like a case note. Not a prompt problem — a comprehension ceiling. True is stronger with no AI: zero third-party origins, and "no AI reads your words either" is a cleaner pitch. See docs/superpowers/specs/2026-07-17-on-device-ai-design.md.

## Deploy

- **Web:** Netlify deploys from GitHub `main` automatically. Pushing = live
  at https://true-app-beta.netlify.app. The owner also edits on github.com,
  so `git fetch` and rebase before starting work and before pushing.
- **Android:** `npm run release:android` (needs android/keystore.properties),
  or Codemagic `android-internal`.
- **iOS:** Codemagic `ios-testflight` (no Mac needed).

## Working rules

- `npm test` must pass before pushing. The tests guard the two ways True has
  lost young people's stories (Lock→unlock, and a mistyped code followed by
  closing the app). Add a test when you touch saving, locking or backup.
- Never commit, generate or handle the owner's signing keys, API keys or
  their passwords. keystore.properties, *.jks, *.keystore are git-ignored.
- Any claim in the listings, support or privacy pages must be true of the
  code. Check before writing it.
- Check `git status` before committing: stray empty files named after code
  fragments mean the Ruflo hooks are broken again (see docs or memory).

## Constraints

- UK GDPR / ICO Children's Code compliant
- No data sharing — ever
- PIN lock always present
- Never clinical, never institutional
- Mobile-first
