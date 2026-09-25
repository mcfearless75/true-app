# True: Google Play listing

Everything to paste into Play Console, in the order the console asks for it.
Images are in `store/play/` and come from `npm run store`.

---

## Main store listing

**App name** (30 max, 28 used)

```
True: Private Journal & Mood
```

**Short description** (80 max, 76 used)

```
Check in, write it down, see how far you've come. Locked with your own code.
```

**Full description** (4,000 max)

```
True is a private space on your phone for how you actually feel.

Check in with your mood in a few seconds. Write when you want to, with a prompt if you're stuck. Keep the moments that matter: a new school, a driving test, the day you said something out loud for the first time. Look back and see how far you've come.

Only you can open it
• You choose a 4-digit code. Unlock with your fingerprint or face if you like.
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

**App icon**: `store/play/icon-512.png`
**Feature graphic**: `store/play/feature-graphic.png`
**Phone screenshots** (upload in this order):
`phone-01-lock.png` … `phone-08-calm.png`

**Category**: Lifestyle
(Health & Fitness would put True next to clinical tools and brings extra
health-app scrutiny. Lifestyle matches "a wise friend, not a clinician".)

**Tags**: Journal, Mental wellness, Mood tracker (pick what Play offers)

**Contact email**: hello@trueapp.co.uk
**Website**: https://true-app-beta.netlify.app (swap for trueapp.co.uk when it's live)
**Privacy policy URL**: https://true-app-beta.netlify.app/privacy.html
(draft ready, needs your company details first; see the end of this file)

---

## App content (Policy → App content)

### Privacy policy
The URL above.

### Ads
**No, my app does not contain ads.**

### App access
**All functionality is available without special access.**
Reviewers create their own 4-digit code the first time they open the app.
There's no login. Fingerprint unlock, backup and the daily nudge are all
optional and switch on under About Me (tap the initial, top right).

### Content rating (IARC questionnaire)
- Category: **Reference, News, or Educational**? No. Pick **All other app types**.
- Violence, sexuality, language, controlled substances, gambling: **No** to all.
- Users can interact or exchange content: **No.** Nothing a user writes
  reaches another user. "Share my week" hands a mood summary to the phone's
  own share sheet, and the user picks where it goes.
- Shares the user's location: **No.**
- Allows purchases: **No.**
Expect PEGI 3 / Everyone.

### Target audience and content
- Age groups: **9–12** (True starts at 10), **13–15**, **16–17**, **18+**.
- Because under-13s are included, **Google Play's Families Policy applies.**
  True already fits it: no ads, no analytics or other SDKs that collect data,
  no accounts. Keep it that way. Adding any third-party SDK later means
  checking it against the Families Self-Certified list first.
- Appeals to children: say **yes**. Don't fight it.

### Data safety
Our reading of Google's rules. Check the wording against the console on the day.

- **Does your app collect or share any of the required user data types?**
  **No.**
  - Everything a user writes stays on their phone.
  - The optional backup is end-to-end encrypted: the key comes from a
    recovery code that never leaves the phone, and we can't decrypt it.
    Google's guidance treats end-to-end encrypted data as not collected.
  - Biometrics are handled by Android. True never receives a fingerprint
    or face.
  - Notifications are scheduled on the phone. There's no push server.
- **Is all user data encrypted in transit?** **Yes.** Backup uses HTTPS only.
- **Do you provide a way for users to request deletion?** **Yes.**
  "Turn off backup" deletes the online copy, and "Start fresh" wipes the phone.

If Google's reviewers read the encrypted backup as "collected", the fallback
answer is: **Personal info → Other (encrypted journal backup)**, *optional*,
*not shared*, purpose **App functionality**.

### Health apps declaration
Select **Mental and behavioural health / wellness: mood tracking, journalling,
stress management (breathing)**. True makes no medical claims and gives no
diagnosis. The copy above keeps it that way.

### Government apps, financial features, news
None apply.

---

## Before you submit

1. **Privacy policy.** `privacy.html` is drafted but **not pushed**: Netlify
   publishes everything in the repo, and the draft still needs
   - your legal name or company name, and registered address
   - your ICO registration number (the ICO fee applies to most organisations
     processing personal data; check at ico.org.uk)
   Fill those in (search the file for `[[`) and it's ready to go live.
2. **Screenshots show the demo account (Jordan).** No real young person's
   words appear anywhere.
3. **Test on a real Android phone** before the first upload. The emulator
   passed everything, but a real fingerprint sensor and a real phone's
   power-saving can behave differently.
4. **Internal testing track first.** Upload `app-release.aab` there, install
   it through Play on your own phone, then promote to closed testing with
   your beta young people. New personal developer accounts must run a closed
   test with at least 12 testers for 14 days before production.
