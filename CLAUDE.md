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
├── index.html                    ← full app
├── beta.html                     ← beta landing page for young people
├── feedback.html                 ← beta feedback form
├── feature-future-letter.html    ← letter feature (not yet integrated)
├── INTEGRATE-LETTER-FEATURE.md  ← integration instructions
└── README.md
```

## Current Features (index.html)

- PIN lock + onboarding (name, age, PIN setup)
- Home dashboard (mood bar, daily prompt, last milestone)
- Mood check-in (5-point + optional note)
- Journal (rotating prompts, entry history)
- About Me (values, goals, self-knowledge note)
- Milestones (add/view by category)
- Journey timeline (filterable)
- localStorage persistence

## Status (July 2026 — Fable rebuild)

DONE: PWA (manifest/sw/icons), Letter to Future Me integrated, demo data behind ?demo=1,
mood colours fixed, nav restructured (About Me via avatar, Milestones via Journey).
See REIGNITE.md for full detail and next steps.

## Next Features (priority order)

1. Age-adaptive UI (under 14 vs 16+) — currentAge() helper exists
2. Hash the PIN (Web Crypto SHA-256)
3. Data export (JSON download — GDPR + care leaver continuity)
4. ~~AI journalling~~ DONE July 2026 — fully on-device via WebLLM (Llama 3.2 1B, WebGPU). No server, no API key; reflect.mjs deleted. Entries structurally cannot leave the device.
5. Formspree on feedback.html
6. Capacitor.js for iOS/Android (only after beta validation)

## Deploy (Netlify — free)

Drag true-app folder to netlify.com dashboard. Share the URL as beta link.

## Constraints

- UK GDPR / ICO Children's Code compliant
- No data sharing — ever
- PIN lock always present
- Never clinical, never institutional
- Mobile-first
