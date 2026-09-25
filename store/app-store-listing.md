# True: App Store listing

Everything to paste into App Store Connect, in the order it asks.
Screenshots are in `store/appstore/` and come from `npm run store`.
The Google Play equivalent is `store/play-listing.md`.

---

## App information

**Name** (30 max, 28 used)

```
True: Private Journal & Mood
```

**Subtitle** (30 max, 26 used)

```
Check in, write, look back
```

Apple searches the name and subtitle, so the keywords below don't repeat
their words.

**Primary category**: Lifestyle
**Secondary category**: leave empty (Health & Fitness is an option, but
True makes no health claims and doesn't need the extra review scrutiny)

**Content rights**: No, True doesn't contain or show third-party content.

---

## Version page (1.0)

**Promotional text** (170 max; you can change it any time without review)

```
Your words stay on your phone, locked with your own code. No accounts, no ads, no adult logins. Check in, write it down, and see how far you've come.
```

**Description** (4,000 max)

```
True is a private space on your phone for how you actually feel.

Check in with your mood in a few seconds. Write when you want to, with a prompt if you're stuck. Keep the moments that matter: a new school, a driving test, the day you said something out loud for the first time. Look back and see how far you've come.

Only you can open it
• You choose a 4-digit code. Unlock with Face ID if you like.
• Your words are encrypted on your phone with a key made from your code.
• No accounts. No carer logins. No reports to anyone.
• No ads, no tracking, and no AI reading what you write.
• "Look like notes" changes the name on screen, so True is less obvious if someone picks up your phone.

What's inside
• Mood check-ins, with a week-at-a-glance view
• A journal with prompts for when the page feels blank
• Letters to future you, sealed until the age you pick
• Milestones, with a photo or voice note if you want one
• Your journey: every mood, entry and milestone on one timeline
• Take a minute: a breathing space for when everything's loud
• Help one tap away, even from the lock screen: Childline, Shout, Samaritans and Papyrus
• A gentle daily nudge, if you want one, that never says what's inside

Yours to keep
Download everything you've written in one file, whenever you like. Turn on backup and True keeps a scrambled copy online that only your recovery code can open. We can't read it. Lose your phone, and your story comes back with you.

Forgot your code? Your recovery code gets you back in, with nothing lost.

Made for young people aged 10 to 21, including those growing up in care.

Your words. Your truth.
```

**Keywords** (100 max, comma-separated, no spaces)

```
diary,feelings,wellbeing,mental health,teen,care leaver,emotions,self care,memories,reflect,calm
```

**Support URL**: https://true-app-beta.netlify.app/support.html
**Marketing URL** (optional): https://true-app-beta.netlify.app/beta.html
**Privacy Policy URL**: https://true-app-beta.netlify.app/privacy.html
(the draft is ready but not pushed; see "Before you submit")

**Screenshots, iPhone 6.9" display** (upload in this order; Apple scales
these down for smaller iPhones, so one set is enough)
`iphone-6.9-01-lock.png` … `iphone-6.9-08-calm.png`

**iPad**: none needed. The project is set to iPhone only
(`TARGETED_DEVICE_FAMILY = 1`). iPads can still run it in iPhone mode.

**Copyright**: `2026 [[LEGAL NAME OR COMPANY NAME]]`

**Version**: 1.0 · **Build**: from Xcode / Codemagic

---

## App Review information

**Sign-in required**: No.

**Notes for the reviewer** (paste as-is):

```
True is a private journal for young people aged 10 to 21. There is no account or login.

To review: open the app, tap "Get started", enter any name and age, and choose any 4-digit code. Everything is then available.

Optional features, under About Me (tap the initial, top right):
• Unlock with Face ID: stores the user's code in the Keychain, gated by biometrics (BIOMETRY_CURRENT_SET). If Face ID enrolment changes, True switches it off and asks for the code.
• A nudge to check in: one local notification a day. No push server.
• Backup: end-to-end encrypted with a key derived from a recovery code that never leaves the device. We cannot read backups.
• Look like notes: changes the on-screen name and lock-screen text to "Notes" so the app is less obvious to someone looking over the user's shoulder. It changes no functionality and hides nothing from the user. The home-screen icon doesn't change.

Help links (Childline, Shout, Samaritans, Papyrus) are reachable from the lock screen without unlocking.
```

**Contact**: your name, phone and email (Apple only uses these to reach you
during review).

---

## App Privacy ("nutrition label")

Our reading of Apple's rules. Check the wording in App Store Connect on the day.

**Do you or your third-party partners collect data from this app?**
**No, we do not collect data from this app.** → the label reads
**"Data Not Collected"**.

Why this holds:
- Everything a user writes stays on the device, encrypted with their code.
- The optional backup is ciphertext encrypted with a key that never leaves
  the phone. We can't read or use it, and it isn't linked to anyone.
- Face ID is handled by iOS. True never receives face data.
- Notifications are scheduled on the device.
- No analytics, advertising or third-party SDKs.

If Apple's reviewers read the encrypted backup as collected, the fallback is:
**User Content → Other User Content**, *not linked to identity*, *not used
for tracking*, purpose **App Functionality**.

---

## Age rating

Answer the questionnaire honestly:
- Violence, sexual content, profanity, horror, drugs, gambling, contests: **None**.
- Medical or treatment information: **None**. True gives no advice or diagnosis.
- Health or wellness topics: **Yes**. Mood tracking, journalling and breathing.
- User-generated content shared with others / messaging: **No.** Nothing a
  user writes reaches another user.
- Advertising: **No.** Unrestricted web access: **No.**

Expect **4+** or **9+**. If the result comes out above 9+, children aged
10 to 12 on a Family Sharing account would need a parent's approval to
download it. That matters for councils rolling it out, so tell me and we'll
look at the answer that raised it.

**Made for Kids / Kids Category: No.** The Kids Category requires a parental
gate before any link out of the app. That would put a barrier between a
child and Childline. True still follows the Kids rules anyway: no ads, no
analytics, no third-party SDKs.

---

## Export compliance (asked on every build upload)

True uses encryption: AES-GCM and PBKDF2 through the operating system's own
Web Crypto, plus HTTPS. These are standard algorithms supplied by iOS, with
nothing proprietary. That normally qualifies for the standard-encryption
exemption.

Once you've confirmed that answer, add this to `ios/App/App/Info.plist` so
Xcode stops asking on every upload:

```xml
<key>ITSAppUsesNonExemptEncryption</key>
<false/>
```

I haven't added it: it's a legal declaration, so it's yours to make.

---

## Before you submit

1. **Apple Developer Program** (£79/year). If True is sold to councils,
   enrol as an **organisation**. Individual enrolment shows your personal
   name as the seller on the App Store. Organisation enrolment needs a
   D-U-N-S number (free, takes a few days to arrive).
2. **Privacy policy and copyright**: fill in `[[…]]` in `privacy.html` and
   above, then push.
3. **Build and test on a real iPhone.** Face ID, the notification prompt and
   the splash screen have only been checked on Android. The iOS build needs
   a Mac with Xcode, or Codemagic (cloud builds, works from Windows).
4. **TestFlight first.** Upload the build, install it through TestFlight on
   your own iPhone, then invite your beta young people (external testers
   need a short Beta App Review).
5. **Councils rolling it out** can use Apple Business Manager to distribute
   True to managed devices. The public App Store listing works for that too.
