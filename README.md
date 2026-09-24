# FaithPath Worship (basic version)

A React Native + Expo app for viewing worship songs, a Telugu Bible reader,
and personal notes/announcements — built for Christian users to browse
during worship and personal devotion.

**Accounts now run on Supabase** (see `SUPABASE.md` for the schema/setup) —
sign up, sign in, and forgot-password all talk to a real backend, so an
account works across devices/reinstalls. **Notes and your theme preference
are still local-only**, stored on-device via `AsyncStorage` (deliberately —
see the conversation history / project notes for why: Supabase's free tier
row quota is being reserved for accounts, not per-user note text). That
means notes and the light/dark preference still don't sync and are lost on
uninstall, but your account and password aren't.

Requires a `.env` file in the project root (gitignored) with:
```
EXPO_PUBLIC_SUPABASE_URL=<your project url>
EXPO_PUBLIC_SUPABASE_ANON_KEY=<your anon/publishable key>
```
Get both from Supabase dashboard → Project Settings → API. Never put the
`service_role`/secret key here or anywhere in this app.

---

## 1. Project structure

```
App.js                     # Providers (Theme, Auth) + navigation root
assets/inputs/              # <- drop song .docx files here (see section 6a)
  telugu-hymns/
  worship-songs/
  prayer-songs/
  kids-songs/
scripts/
  generate-songs.js         # converts assets/inputs/*.docx -> src/data/songs/*.json
src/
  lib/
    supabaseClient.js       # Supabase client (URL/key from .env)
  context/
    ThemeContext.js        # light/dark theme state, persisted locally
    AuthContext.js         # sign up / sign in / sign out / forgot-password, via Supabase
  theme/colors.js          # all colors — edit here to re-theme the app
  data/
    homeCards.js           # the 8 home-screen cards (titles, icons, action)
    teluguAlphabet.js       # Telugu letters for the browse-by-letter screen
    songs/                  # generated song data (see section 6a) — don't
                             # hand-edit these .json files, edit the .docx
                             # in assets/inputs/ instead and regenerate
    sampleBibleTe.js        # sample Telugu Bible verses (placeholder data)
    dailyMessages.js        # the "today's word" pop-up messages
    contactInfo.js          # Contact Us screen content
  components/               # shared UI: buttons, form fields, cards, etc.
  screens/                   # one file per screen
  navigation/                # React Navigation stacks/tabs
```

Everything content-related (card titles, contact details, bible verses,
colors) lives in plain data files under `src/data` and `src/theme` — you
can edit those directly without touching any screen/logic code. Songs are
the one exception — edit the `.docx` files in `assets/inputs/`, not the
generated JSON (see section 6a).

## 2. Prerequisites

- [Node.js](https://nodejs.org/) LTS installed on your computer.
- The **Expo Go** app installed on your Android/iOS phone (from Play
  Store / App Store).
- Your phone and computer on the **same Wi-Fi network** (or use tunnel
  mode, see troubleshooting below).

> **This project targets Expo SDK 54** (matches `expo` in `package.json`).
> Expo Go only runs one SDK version at a time — whatever the Play
> Store/App Store currently ships. If `npx expo start` reports
> *"Project is incompatible with this version of Expo Go"*, it means your
> installed Expo Go and this project are on different SDKs. Check the SDK
> number shown in Expo Go's own settings/about screen against the `expo`
> version here, then either update Expo Go, or align the project to it:
> ```bash
> npx expo install expo@<the SDK number Expo Go reports>
> npx expo install --fix
> ```

## 3. Running the app in Expo Go (day-to-day development)

```bash
# 1. Install dependencies (only needed once, or after pulling new changes)
npm install

# 2. Start the Metro bundler
npx expo start
```

This prints a QR code in the terminal.

- **Android**: open the Expo Go app → "Scan QR code" → scan it.
- **iOS**: open the Camera app and scan the QR code, then tap the
  notification to open it in Expo Go.

The app reloads automatically whenever you save a file. Shake the phone
(or press `m` in the terminal menu) to open the in-app developer menu
(reload, toggle inspector, etc).

If your phone can't reach your computer's network directly:

```bash
npx expo start --tunnel
```

(slower, but works across networks/VPNs/restrictive Wi-Fi).

## 4. Testing on an emulator instead of a physical phone

```bash
npx expo start --android   # requires Android Studio + an emulator running
npx expo start --ios       # requires a Mac with Xcode
```

## 5. Building an installable `.apk` with EAS

Expo Go is great for development, but to share a real installable app with
others (without them needing Expo Go) you build a standalone `.apk` using
**EAS Build** (Expo's cloud build service — free tier available).

> **Always run this first**, before every build:
> ```bash
> npx expo-doctor
> ```
> It catches native-module version mismatches (e.g. a package left over
> from an old SDK, or two copies of the same native module at different
> versions) that Metro/Expo Go can't detect — Expo Go always uses its own
> bundled copies of native modules, so a mismatch only shows up once you
> build a real `.apk` and it crashes on launch with something like
> `NoSuchMethodError` or `NoClassDefFoundError`. If it reports duplicates
> or a missing peer dependency, fix that first (usually
> `npx expo install <package-name>` to pin the correct version), then
> re-run `npx expo-doctor` until it says "no issues detected".

```bash
# 1. Install the EAS CLI globally (one-time)
npm install -g eas-cli

# 2. Log in with your Expo account (create one free at expo.dev if needed)
eas login

# 3. (Already done in this repo — eas.json exists) Otherwise you'd run:
#    eas build:configure

# 4. Kick off an Android build that produces a downloadable .apk
eas build --platform android --profile preview
```

This uploads your project to Expo's servers, builds it, and gives you a
link when it's done (also visible on your [expo.dev](https://expo.dev)
dashboard under your project → Builds). Download the `.apk` from that link
and install it on any Android phone (you may need to allow "install from
unknown sources").

Build profiles (see `eas.json`):
- **development** — a dev-client build for use with `expo start` outside
  of Expo Go. Not needed for basic testing.
- **preview** — an internal `.apk`, good for sharing with testers. Use this
  one for now.
- **production** — used later when publishing to the Play Store (produces
  an `.aab` unless you add `"buildType": "apk"` there too).

To also get an iOS build you'll need a paid Apple Developer account —
skip this until you're ready to publish to the App Store; Android `.apk`
testing works today without one.

> **Supabase env vars in `.apk`/EAS builds**: `eas build` runs on Expo's
> servers against a fresh copy of the repo — it never sees your local
> `.env`. `eas.json` therefore has the Supabase URL/anon key set directly
> under each profile's own `"env"` block, so cloud builds have them too.
> That's safe only because it's the anon/publishable key (meant to be
> public); if this project ever adds a real secret to `.env`, it must use
> [EAS's own encrypted environment variables](https://docs.expo.dev/eas/environment-variables/)
> instead of putting it in `eas.json`.

## 6. Customizing content

- **Colors / theme**: `src/theme/colors.js` (`lightColors`, `darkColors`).
- **Home screen's 8 cards**: `src/data/homeCards.js` — rename titles,
  swap icons (any name from
  [Ionicons](https://icons.expo.fyi/Index?family=Ionicons)), or change
  what a card opens (`action: 'alphabet' | 'bible' | 'comingSoon' | 'notes'`).
- **Bible content**: `src/data/sampleBibleTe.js` currently has a handful of
  sample verses only. Replace with a full Telugu Bible dataset shaped the
  same way (`books: [{ book, bookEn, chapter, verses: [{ num, te, en }] }]`)
  when you have one ready — no UI changes needed.
- **Contact Us details**: `src/data/contactInfo.js`.
- **Daily encouragement pop-up**: `src/data/dailyMessages.js` — add, remove,
  or reword any of the messages shown once per app open.
- **App icon / splash**: replace the files in `assets/` (currently the
  default Expo placeholder icons) with your FaithPath Worship logo, same
  filenames.

### 6a. Adding or updating songs (no code changes needed)

Songs live as `.docx` files under `assets/inputs/<category>/` — one folder
per left-hand home card (see the table in `assets/inputs/README.md`).
Whoever maintains the song list doesn't need to touch any code:

1. Open (or create) a `.docx` file in the right category folder and add
   songs, each starting with a line that's just a number and a dot (`11.`,
   `12.`, ...) — see `assets/inputs/README.md` for the exact format.
2. From the project folder, run:
   ```bash
   npm run generate:songs
   ```
   (this also runs automatically after `npm install` — handy since `eas
   build` always runs `npm install` first, so a cloud build already
   reflects the latest `.docx` files without you doing anything extra).
3. Restart `npx expo start` (or just reload the app) to see the new songs.
   Songs are automatically filed under their first Telugu letter — tap
   that letter from the relevant home card to see them.

A song currently gets one of 4 generic "album art" tiles (cycled, not
downloaded images) and, on its detail screen, one shared **sample** YouTube
video/link — both clearly placeholders until you're ready to attach real
per-song artwork/videos.

## 7. Known limitations (basic version)

- Accounts run on Supabase (see above / `SUPABASE.md`); notes and theme
  preference are still device-local only (see warning at the top).
- Forgot Password checks the email exists, then lets it set a new password
  **with no further verification** (no emailed code, nothing) — a
  deliberate tradeoff to match the app's original local-storage UX. See the
  "Forgot Password: security tradeoff" section in `SUPABASE.md` before
  relying on this with real users' accounts. It also depends on the
  `reset-password` Edge Function being deployed (`SUPABASE.md` has the
  one-time deploy steps) — until that's done, the "Reset Password" step
  will fail even though "Verify Email" works.
- Only the "తెలుగు క్రిస్తవ కీర్తనలు" card (`telugu-hymns`) has real songs
  right now (10, from the sample `.docx`); the other 3 left cards show "no
  songs yet" until `.docx` files are added to their folders (see 6a).
- The "Daily Promise" / "Daily Message" right-hand cards show a "working
  on it" placeholder. Bible has minimal sample data. Song videos all point
  to one shared sample link, and cover art is generic (cycled, not
  downloaded photos) — all intentional for this first pass, replace
  incrementally.
