# On-Device AI "A Thought Back" — Design Spec

**Date:** 17 July 2026 · **Status:** Approved (user, this session)
**Strategy context:** Step 3 of the agreed sequence: ZK backup (done) → vault mode (done) → **on-device AI (WebLLM)** → anonymous council dashboard.

## Decision

"A thought back" (opt-in AI reflection after a journal entry) moves **entirely on-device** via WebLLM.
The server proxy (`netlify/functions/reflect.mjs`) and the `ANTHROPIC_API_KEY` dependency are **deleted**.
Devices without WebGPU do not get the feature and are told so honestly — there is no cloud fallback, by design.
Pitch: entries never leave the device, even for AI. After the one-off model download it works offline.

## Components

1. **Engine** — `@mlc-ai/web-llm` dynamically imported from jsDelivr (pinned version) only when the user enables the feature. Model: `Llama-3.2-1B-Instruct-q4f16_1-MLC` (~700MB one-off download, cached by WebLLM in browser Cache Storage). Model id is a single constant, overridable via `localStorage true_ai_model` for device testing.
2. **Feature detection** — `localAISupported()`: `navigator.gpu` plus a real `requestAdapter()` call.
3. **About Me card** (replaces the current toggle card, JS-rendered):
   - Unsupported device: honest explanation, no button.
   - Supported, off: explanation + "Turn on" → download overlay.
   - On: status + "Turn off" (keeps cached model) + quiet "Remove the AI from my phone" (turns off and deletes the model cache via `deleteModelAllInfoInCache`).
4. **Download overlay** — states the ~700MB one-off download (Wi-Fi recommended), on-phone-forever promise, progress from WebLLM's `initProgressCallback`. Requests `navigator.storage.persist()` on enable.
5. **Reflection flow** — same UX as today. Singleton engine, lazy-init on first use after app load ("True is thinking — right here on your phone…"). Chat completion with tight system prompt (ported from reflect.mjs, shortened and more prescriptive for a 1B model), `max_tokens` ≈ 110, temperature 0.7. Output guardrails: strip markdown chars, cap at 4 sentences, minimum length, HTML-escape; anything malformed → silent skip (existing ethos).
6. **Crisis gate** — before any AI call, an on-device keyword check on the entry (suicide/self-harm phrases). On match: no AI; show a warm static line pointing to the existing "Need to talk to someone" help overlay instead. A 1B model must not improvise on crisis content; the check itself never leaves the phone.

## Plumbing changes

- **sw.js** — fetch handler currently caches every GET including cross-origin: it would swallow ~700MB of model shards into the app cache and delete them on each version bump. Fix: skip non-same-origin requests entirely (WebLLM manages its own cache). Bump `CACHE` to `true-v11`.
- **netlify.toml CSP** — add `'wasm-unsafe-eval'` and `https://cdn.jsdelivr.net` to `script-src`; add jsDelivr, `huggingface.co`, `*.huggingface.co`, `*.hf.co`, `raw.githubusercontent.com` to `connect-src`; add `worker-src 'self' blob:`.
- **Delete** `netlify/functions/reflect.mjs`. `ANTHROPIC_API_KEY` can be removed from Netlify env afterwards (manual).
- `S.aiReflect` remains the single opt-in flag.
- Update the stale "AI journalling via Anthropic API" line in the project CLAUDE.md.

## Not in scope (YAGNI)

Chat interface · AI anywhere except the post-journal reflection · model choice UI · cloud fallback of any kind.

## Test checklist

- Unsupported path: card explains, no button (verified by stubbing `navigator.gpu`).
- Enable flow: overlay → progress → on; persists across reload.
- Reflection generates end-to-end in a WebGPU browser (small-model override acceptable for the session; shipping constant stays Llama 1B — flag if not tested at full size).
- Crisis phrase skips AI and shows the help pointer.
- Turn off keeps cache; "Remove" clears it.
- Journal save still works when AI off/unavailable; no console errors; `CACHE` bumped.
