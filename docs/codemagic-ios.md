# Building the iOS app with Codemagic

Codemagic builds True on a cloud Mac and sends it to TestFlight, so you can
install it on an iPhone without owning a Mac. The build itself is defined in
`codemagic.yaml` at the root of the repo. This page covers the one-off setup,
which only you can do because it involves your Apple account.

Budget about an hour, plus waiting time for Apple.

**Never paste the API key (.p8 file) or certificate passwords into chat, an
email, or a file in this repo.** They go straight into Codemagic, which
stores them encrypted.

---

## 1. Apple Developer Program

Enrol at developer.apple.com/programs (£79/year).

Enrol as an **organisation** if True is sold to councils: the App Store then
shows your organisation, not your personal name, as the seller. You'll need
a free D-U-N-S number first (request it through Apple's enrolment page; it
takes a few days).

## 2. Register True's bundle ID

developer.apple.com → Certificates, IDs & Profiles → Identifiers → **+** →
App IDs → App.

- Description: `True`
- Bundle ID (explicit): `uk.co.trueapp.app`
- Capabilities: leave the defaults. Face ID and local notifications need no
  extra capability. Don't tick Push Notifications: True has no push server.

## 3. Create the app in App Store Connect

appstoreconnect.apple.com → Apps → **+** → New App.

- Platform: iOS
- Name: `True: Private Journal & Mood`
- Primary language: English (U.K.)
- Bundle ID: `uk.co.trueapp.app`
- SKU: `true-ios` (internal only; anything unique)
- User access: Full Access

Then open the app → App Information → General Information, and copy the
**Apple ID** (a number like 6740000000). Put it in `codemagic.yaml` as
`APP_STORE_APPLE_ID`, or send it to me and I'll add it. It isn't secret.

## 4. Make an App Store Connect API key

App Store Connect → Users and Access → Integrations → App Store Connect API
→ Team Keys → **+**.

- Name: `Codemagic`
- Access: **App Manager**

Download the `.p8` file. **Apple only lets you download it once.** Note the
**Issuer ID** (top of the page) and the **Key ID**.

## 5. Connect Codemagic

1. Sign up at codemagic.io with your GitHub account. The free plan includes
   500 build minutes a month on M2 Macs, and one True build takes about
   15 to 20 minutes.
2. Add application → GitHub → `mcfearless75/true-app` → it finds
   `codemagic.yaml`.
3. Team settings → Integrations → **Developer Portal** → Manage keys → Add key:
   - App Store Connect API key name: **`True App Store Connect`**
     (exactly this: `codemagic.yaml` refers to it by name)
   - Issuer ID, Key ID, and the `.p8` file from step 4

## 6. Signing certificate and profile

Codemagic → Team settings → **Code signing identities**.

1. iOS certificates → **Generate certificate** → type *Apple Distribution*,
   using the key from step 5. Codemagic stores it. If it asks you to set a
   password, put it in your password manager.
2. iOS provisioning profiles → **Fetch profiles** → pick the *App Store*
   profile for `uk.co.trueapp.app`. If none exists yet, create one first at
   developer.apple.com → Profiles → **+** → App Store Connect → pick the
   App ID from step 2 and the certificate from step 6.1.

## 7. First build

Codemagic → True → **Start new build** → workflow `ios-testflight`.

When it goes green (about 20 minutes), the build shows up in App Store
Connect → TestFlight after Apple finishes processing, which takes another
10 to 30 minutes. Apple asks the export compliance question on each build
until `ITSAppUsesNonExemptEncryption` is set (see `store/app-store-listing.md`).

Install the **TestFlight** app on your iPhone, accept the invite, and
install True.

If a build fails, the log in Codemagic says which step. Send me the red
part of the log and I'll fix it.

---

## What to test on the iPhone

This is True's first run on iOS. Everything below passed on Android.

- [ ] Opens to the cream splash, then onboarding. No white or black flash,
      in light or dark mode.
- [ ] Onboarding → set a code → write a journal entry and add a photo.
- [ ] Close True fully (swipe it away) and reopen: code works, entry and
      photo are still there.
- [ ] About Me → Unlock with Face ID → Turn on. iOS asks permission once.
- [ ] Lock, then reopen: Face ID offers itself straight away and opens True.
- [ ] Settings → Face ID & Passcode → Set Up an Alternative Appearance. Back
      in True, it should say Face ID was switched off and ask for your code.
      (Remove the alternative appearance afterwards.)
- [ ] A nudge to check in → set it a couple of minutes ahead → Turn on →
      Allow notifications → lock the phone → the nudge arrives saying
      "Got a minute for yourself?", nothing more.
- [ ] Turn on backup, note the code, delete True, reinstall from TestFlight,
      "I had True before" → your story comes back.
- [ ] "Need to talk to someone right now?" on the lock screen: each number
      opens the Phone or Messages app.
