# Building the Android app with Codemagic

The `android-internal` workflow in `codemagic.yaml` builds the signed
Android bundle in the cloud and uploads it to Google Play's **internal
testing** track. You can still build locally with `npm run release:android`,
and the two produce the same thing.

This page covers the one-off setup. It involves your Google account and
the upload key, so only you can do it. Budget about 45 minutes.

**Never paste the upload key, its passwords, or the Google service-account
JSON into chat, an email, or a file in this repo.** They go straight into
Codemagic, which stores them encrypted.

---

## 1. The upload key

If you haven't yet, create it by following "Your steps" in the release
signing notes: `keytool …` makes `C:/Users/LAPTOP80/true-keys/true-upload.jks`,
alias `true-upload`. Back it up.

## 2. Google Play developer account

play.google.com/console, one-off £20.

Register as an **organisation** if True is sold to councils: Play shows the
developer name on the listing, and organisation accounts skip the rule that
makes new *personal* accounts run a 12-tester, 14-day closed test before
going public. Organisation sign-up needs a D-U-N-S number (the same one Apple
asks for).

## 3. Create the app and do the first upload by hand

Google's API can't upload to an app that has never had a bundle, so the
first one goes up manually.

1. Play Console → **Create app** → name `True: Private Journal & Mood`,
   app, free.
2. Build it locally: `npm run release:android`.
3. Testing → **Internal testing** → Create new release → keep **Play App
   Signing** on → upload `android/app/build/outputs/bundle/release/app-release.aab`.

From then on, Codemagic uploads every new build.

## 4. A service account so Codemagic can upload

1. console.cloud.google.com → create a project (e.g. `true-play`) →
   APIs & Services → enable **Google Play Android Developer API**.
2. IAM & Admin → Service accounts → **Create** (e.g. `codemagic-upload`) →
   Keys → Add key → **JSON**. A `.json` file downloads.
3. Play Console → **Users and permissions** → Invite new users → paste the
   service account's email (ends `iam.gserviceaccount.com`) → App
   permissions → True →
   - Release apps to testing tracks
   - View app information
   (Nothing else. It doesn't need production release rights.)

## 5. Give Codemagic the key and the service account

1. Codemagic → Team settings → **Code signing identities** → Android
   keystores → Add:
   - File: `true-upload.jks`
   - Keystore password, key alias `true-upload`, key password
   - Reference name: **`true_upload_key`** (exactly this:
     `codemagic.yaml` refers to it by name)
2. Codemagic → True → **Environment variables** → Add:
   - Name: `GOOGLE_PLAY_SERVICE_ACCOUNT_CREDENTIALS`
   - Value: the whole contents of the service-account `.json` file
   - Group: **`google_play`**
   - Tick **Secure**

## 6. Build

Codemagic → True → **Start new build** → workflow `android-internal`.

About 10 minutes later the build appears in Play Console → Internal testing
as a **draft**. Review it and press **Start rollout**. Testers on your
internal list get it through the Play Store.

Once True's first release has passed Google's review, change
`submit_as_draft: true` to `false` in `codemagic.yaml` and builds will go
straight to internal testers.

If a build fails, the log in Codemagic shows which step. Send me the red
part and I'll fix it.

---

## Version numbers

Play refuses a bundle whose `versionCode` it has already seen. Codemagic
works out the next one itself (the highest on Play, plus one). For a
local upload, raise the default in `android/app/build.gradle` first, or
build with `-PversionCode=N`.
