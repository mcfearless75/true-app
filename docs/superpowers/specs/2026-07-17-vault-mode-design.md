# Vault Mode (18+) — Design Spec

**Date:** 17 July 2026 · **Status:** Approved (user, this session)
**Strategy context:** Step 2 of the agreed sequence: ZK backup (done) → **leaving-care vault mode (18+)** → on-device AI → anonymous council dashboard.

## What it is

At 18+, True unlocks the **Vault**: the young person's whole history — moods, journal, milestones, letters, photos, voice notes — presented as a permanent life record they own, with a one-tap export they can take anywhere.

**Positioning:** care leavers normally have to request their council file — someone else's notes about them, often redacted. The Vault is the record *they* kept. No server involvement; export is generated entirely on-device.

## Decisions made

| Question | Decision |
|---|---|
| Core shape | My Story archive (not rights-content companion, not second-PIN vault) |
| Activation | Auto-appear invite at 18+, user opts in by tapping. Nothing changes until they do. |
| Eligibility | App stores age bands, not DOB. `19-21` band: eligible immediately. `17-18` band: invite reads "I'm 18 — open my Vault" (the tap is the confirmation). Younger bands never see it. |
| Navigation | New 8th view `view-vault`. Bottom nav unchanged (5 slots stay). Reached via cards on Home and About Me. |

## Components

1. **`vaultEligible()`** — `S.age === '17-18' || S.age === '19-21'`. New state field `S.vaultOn` (bool, default false) set on first opt-in.
2. **Invite/entry cards** — rendered on Home (`#home-vault`) and About Me (`#me-vault`) when eligible. Before opt-in: warm invite copy. After: "My Vault →" shortcut.
3. **Vault view** —
   - Story header: "Keeping True since {earliest entry date}" + counts (check-ins, journal entries, milestones, letters).
   - **Take my story with me** — generates a self-contained, styled, print-friendly HTML document on-device: About Me front section, then the full story oldest-first, media embedded as data URLs, locked letters included but sealed behind a `<details>` fold ("sealed until {year}"). Downloads as `true-my-story-YYYY-MM-DD.html`.
   - "Download my everything (JSON)" — existing `exportData()` alongside.
   - Backup status: nudge to enable ZK backup if off; last-backup date if on.
   - Full timeline, unfiltered — reuses the Journey renderer via an extracted `timelineHTML(items)` builder shared by both views.
4. **Escaping** — all user text in the generated story document goes through an `esc()` HTML-escape helper (user entries may contain markup).

## Not in scope (YAGNI)

Leaving-care rights content · second PIN · any server involvement · new data types. Vault is read-and-export only.

## Constraints honoured

No adult access, no data sharing, on-device only, UK English, warm non-institutional voice, mood colours untouched.

## Test checklist

- Onboard as `19-21` → invite appears on Home and About Me; tap opens Vault.
- Onboard as `17-18` → invite reads "I'm 18 — open my Vault".
- Onboard as `14-16` / `10-13` → no vault anywhere.
- Exported HTML opens standalone in a browser, media plays, locked letters sealed, prints cleanly.
- Existing REIGNITE.md checklist still passes; `CACHE` bumped in sw.js before deploy.
