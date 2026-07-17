# Rebranding True — read this first

The Ember→True rebrand in March broke the app. A script blanket-replaced orange
hexes, so **"Really low" rendered in brand teal** — visually identical to the
positive end of the scale. The mood scale silently stopped meaning anything, and
nobody noticed until an audit months later.

The colours are now tokenised specifically so that can't happen again.
**Do not find-and-replace hex codes. Ever.** Change the tokens below instead.

## The rule

| Block | Rebrand? |
|---|---|
| `--tr --trlt --trdark --glow --gllt --acc --ash --warm` | **Yes** — this is the brand |
| `--mood-1 … --mood-5` | **NEVER.** These carry meaning, not identity |
| `--cat-*` | Only if the new palette demands it; they're their own scale |
| `--rec` | No — "recording" red. Same value as `--mood-1` today, different thing |
| `--warn` | No — UI caution. Deliberately not a mood colour |

If a colour tells the user *how they feel*, it is not yours to rebrand.

## The five places to change

1. **`index.html` → `:root`** — the BRAND block only. This drives the whole app,
   including every inline SVG (they use `fill="var(--tr)"`).
2. **`index.html` → `BRAND_EXPORT`** (in the script) — the downloadable story is a
   **standalone document**; the app's `:root` can't reach it, so it carries its own
   brand copy. Its mood palette is read live from `:root`, so leave that alone.
3. **`beta.html` → `:root`** — same BRAND block.
4. **`feedback.html` → `:root`** — same BRAND block.
5. **`<meta name="theme-color">`** in `index.html`, `beta.html`, `feedback.html`.

Plus the assets, which are real files and need regenerating:
`icon.svg`, `icon-192.png`, `icon-512.png`, `icon-maskable-512.png`,
and `theme_color` / `background_color` / `name` / `short_name` in `manifest.json`.

## Renaming (not just recolouring)

- Wordmark is lowercase and appears as text in `index.html` (onboarding, lock,
  header), `beta.html`, `feedback.html`.
- Tagline "Your words. Your truth." — onboarding, lock screen, `beta.html`, and the
  exported story document.
- `localStorage` keys are `true_state`, `true_ai_model`, `true_feedback_queue`;
  IndexedDB is `true_media`; the Netlify Blobs store is `true-backups`.
  **Leave these alone** — renaming them orphans every existing user's data.
  They're invisible to users; the cost of changing them is real.
- Export filenames: `true-my-story-<date>.html` / `.json`.
- Contact address on `beta.html` (currently `hello@trueapp.co.uk`, unverified).

## How to check you haven't repeated March

After any rebrand, load a **populated** account and confirm the five mood colours
are still exactly:

```
1 really low  #C94F35     4 pretty good #1D9E75
2 not great   #D98E2B     5 really good #3B6D11
3 okay        #888780
```

Check them in three places — the mood picker dots, the Home week bar, and the
Journey timeline dots — and in the downloaded story file, which has its own
stylesheet. Then bump `CACHE` in `sw.js`.
