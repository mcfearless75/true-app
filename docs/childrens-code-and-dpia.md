# True: Children's Code self-assessment and DPIA (DRAFT)

> **Draft for review.** Written from what the code does as of 25 September
> 2026 (commit history on `main`). It is not legal advice. Have your data
> protection officer or adviser review it, fill in the `[[…]]` parts, and
> sign it off before giving it to a council. Update it whenever True changes
> what it stores or sends.

---

## Part 1: The ICO Age Appropriate Design Code (Children's Code)

True's users are 10 to 21, so the Code applies. Each of its 15 standards:

| # | Standard | How True meets it | Status |
|---|---|---|---|
| 1 | **Best interests of the child** | Built so the young person owns their story: no adult access, no reports, no monitoring. Helplines (Childline, Shout, Samaritans, Papyrus) are reachable from the lock screen without unlocking. | Meets |
| 2 | **DPIA** | Part 2 of this document. | Draft |
| 3 | **Age-appropriate application** | Age is asked as a band (10–13, 14–16, 17–18, 19–21), not a date of birth. 10–13-year-olds get simpler copy and don't see Letters or "Share my week" (`applyAgeCopy`, `applyNavForAge`). | Meets |
| 4 | **Transparency** | The first screen says in plain words that nothing is shared ("Not your carer. Not your social worker. Not your school. Not us."). Privacy and support pages are written for young people. Each optional feature explains itself where it's switched on. | Meets once privacy.html is published |
| 5 | **Detrimental use of data** | No advertising, no analytics, no engagement tracking. The words never leave the phone unencrypted. | Meets |
| 6 | **Policies and community standards** | No community, no user-to-user content. Nothing a user writes reaches another user. | Not applicable |
| 7 | **Default settings** | Everything optional is **off** by default: backup, reminders, Face ID / fingerprint, "Look like notes". Sharing only happens when the user taps Share. | Meets |
| 8 | **Data minimisation** | No account, email or phone number. The name can be a nickname ("Doesn't have to be your real name"). Age is a band. | Meets |
| 9 | **Data sharing** | None. The optional backup is end-to-end encrypted; we can't read it. | Meets |
| 10 | **Geolocation** | Not collected. The site blocks it outright (`Permissions-Policy: geolocation=()`). | Meets |
| 11 | **Parental controls** | None, by design: an adult who could see a looked-after child's journal would defeat the point. The Code only requires transparency *if* parental controls exist. | Not applicable (explain to commissioners, see Risk R4) |
| 12 | **Profiling** | None. "Your patterns" (streak, counts) is worked out on the phone and says so ("Worked out on this device. Only you see this."). | Meets |
| 13 | **Nudge techniques** | The daily reminder is off by default, opt-in, and neutral ("Got a minute for yourself?"). **One to review:** the Journey page shows a check-in streak ("You're on a 5-day check-in streak"). The ICO names streaks as a technique that can pressure children to keep using a service. True never shows a *broken* streak or a loss message, but consider whether to keep it. See Risk R6. | Review |
| 14 | **Connected toys and devices** | Not applicable. | Not applicable |
| 15 | **Online tools** | Young people can: download everything ("Download my everything"), delete the online backup (Turn off backup), wipe the phone (Start fresh), and recover a forgotten code with their recovery code. | Meets |

---

## Part 2: Data Protection Impact Assessment

### 2.1 What True is

A private journal and mood app for young people aged 10 to 21, including
those in care. It runs as a website (PWA) and as iOS and Android apps built
from the same code. Councils and fostering agencies commission it; the
young person uses it alone.

**Controller:** [[LEGAL NAME OR COMPANY NAME]], [[ADDRESS]], ICO registration [[NUMBER]].
**Processor:** Netlify, Inc. (website hosting and the encrypted backup store).
**Contact:** hello@trueapp.co.uk

### 2.2 Data: what, where, and who can read it

| Data | Where it lives | Protection | Who can read it |
|---|---|---|---|
| Check-ins, journal, letters, milestones, goals, values, self-note | On the phone only | AES-256-GCM, key derived from the young person's 4-digit code (PBKDF2, 210,000 rounds) | The young person, after unlocking |
| Photos and voice notes | On the phone only | AES-256-GCM with a random key stored inside the encrypted story | The young person, after unlocking |
| Name (or nickname) | On the phone, beside the encrypted story | Not encrypted, so the lock screen can say "Welcome back". Not stored there when "Look like notes" is on | Anyone with forensic access to the phone's app storage |
| Age band, code hash and salt, lock-out counter | On the phone | Code stored only as a salted SHA-256 hash | Same as above; reveals no content |
| Optional backup | Netlify Blobs | Encrypted on the phone with a key from a 20-character recovery code that never leaves the phone. Filed under an ID derived from the same code. No name, email or device ID attached | Nobody without the recovery code, including us |
| In the apps: PIN for Face ID / fingerprint | iOS Keychain / Android Keystore | Released only after a biometric match; wiped by the OS if anyone enrols a new face or finger | The young person |
| Website logs | Netlify | Standard hosting logs (IP address, time, page) | Netlify, us on request |
| Beta feedback form (website only, not the app) | Formspree | What the person types | Us |

**Not collected:** accounts, email, phone number, date of birth, location,
contacts, analytics, advertising IDs, crash reports. There are no
third-party SDKs in the app.

### 2.3 Lawful basis

- **On-device processing:** the young person processes their own data on
  their own device. [[Adviser to confirm whether any lawful basis is needed
  for processing the controller never receives.]]
- **Encrypted backup (optional):** [[e.g. legitimate interests, or
  performance of a contract with the commissioning council]]. The
  controller holds ciphertext it can't read, isn't linked to an identity,
  and can't identify whose it is.
- **Special category data:** journal content may reveal health, sexuality,
  religion or other special category data. The controller never has access
  to it in readable form. [[Adviser to confirm the Article 9 position for
  ciphertext held by the controller.]]

### 2.4 Retention and deletion

- On the phone: until the young person deletes it (Start fresh, or
  uninstalling the app).
- Backup: until the young person turns backup off, which deletes it. We
  can't find or delete a backup for someone, because we can't tell whose
  it is. [[Decide whether to add automatic expiry for backups untouched for
  N years, e.g. 7, and say so on the privacy page.]]
- Website logs: Netlify's retention [[check the current plan's log retention]].

### 2.5 Risks and mitigations

| # | Risk | Likelihood / impact | Mitigation | Residual |
|---|---|---|---|---|
| R1 | **Someone else unlocks True** (a carer, sibling or peer who knows or guesses the code) | Medium / high | 4-digit code; lockout after 5 wrong tries; code never stored in readable form; "Look like notes" hides what the app is; Face ID / fingerprint unlock turns itself off if anyone enrols a new face or finger | Medium: a 4-digit code guards against casual access, not a determined adult with time. Consider offering 6 digits. |
| R2 | **Lost or stolen phone** | Medium / medium | Everything is encrypted with the code; the backup can restore everything to a new phone | Low |
| R3 | **Loss of the young person's words** (bugs, full storage, lost code) | Medium / high | Two data-loss bugs were fixed on 25 Sept 2026 and are now covered by automated tests that run on every change; full-storage saves show a warning instead of failing silently; forgot-code recovery; optional backup | Low to medium: young people who never turn on backup and forget their code can't recover. This is by design, and the app says so. |
| R4 | **Safeguarding: a disclosure nobody sees.** A young person may write about harm, and no adult will read it. | Medium / high | Deliberate: True's value depends on no adult reading it. Helplines are one tap away, including from the lock screen, and "Need to talk to someone right now?" appears on the home screen. Commissioners must accept this in writing, and True must never be presented as a safeguarding or monitoring tool. | Accepted by design. Commissioners' own safeguarding routes still apply. |
| R5 | **Backup server breach** | Low / low | The server only holds ciphertext encrypted with keys it never sees, filed under IDs that can't be linked to a person | Very low |
| R6 | **Nudge pressure** from the check-in streak | Low / low | No broken-streak or loss messages; reminders are off by default | Low. Review whether to keep the streak (Children's Code standard 13). |
| R7 | **Recovery code seen by someone else** (written down, photographed, left somewhere) | Medium / high | Anyone with the code can restore the whole story onto their own phone, and the recovery-code screen now says so plainly ("Don't share it — not with a friend, not with a carer"). "Get a new code" (About Me → Backup) makes a new code, backs up under it first, then deletes the copy the old code opened; the old code then opens nothing. | Low to medium: relies on the young person knowing the code was seen. Carers should be told never to ask for it. |
| R8 | **Shoulder-surfing a notification** | Low / low | Reminder text never mentions content; plainer still in "Look like notes" mode | Low |

### 2.6 Consultation

[[Record consultation with young people (beta), a care-experienced advisory
group if one exists, and the commissioning council's DPO.]]

### 2.7 Sign-off

| Role | Name | Date | Decision |
|---|---|---|---|
| Data protection lead | [[ ]] | [[ ]] | [[ ]] |
| Product owner | [[ ]] | [[ ]] | [[ ]] |

---

## Evidence pointers (for reviewers)

- Encryption at rest: `saveState`, `deriveSessionKey`, `getMediaKey` in `index.html`
- Backup: `netlify/functions/backup.mjs`, `deriveBackupMaterial`, `doBackup`
- Native storage and biometrics: `src/native.js`
- Automated checks: `tests/data-safety.spec.mjs` (data never lost, never readable) and `tests/accessibility.spec.mjs` (WCAG 2.2 AA), run on every push by `.github/workflows/tests.yml`
