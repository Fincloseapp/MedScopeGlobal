# MedScope Academy Mobile — EAS Build Setup



## Prerequisites



1. [Expo account](https://expo.dev/signup)

2. EAS CLI: `npm install -g eas-cli`

3. Apple Developer + Google Play Console accounts (for store submission)



## 1. Link EAS project (`projectId`)



`mobile/app.json` ships with a placeholder:



```json

"extra": { "eas": { "projectId": "REPLACE_WITH_EAS_PROJECT_ID" } }

```



### Option A — `eas init` (recommended)



From `mobile/`:



```bash

cd mobile

eas login

eas init

```



`eas init` writes a real UUID into `expo.extra.eas.projectId`.  

Commit the project ID if your team policy allows (no secrets in that field).



### Option B — Manual placeholder flow



If you cannot run `eas init` in CI:



1. Create a project at [expo.dev](https://expo.dev) → **New project** → slug `medscope-academy`.

2. Copy the **Project ID** (UUID) from the project settings.

3. Replace `REPLACE_WITH_EAS_PROJECT_ID` in `app.json` locally.

4. Verify: `eas project:info` should resolve the slug.



> **Smoke check:** After deploy, `GET /api/mobile/health` returns `ok: true` and `syncEndpoint: /api/mobile/sync`. The academy smoke script validates this endpoint.



## 2. Environment variables (EAS Secrets)



Set via dashboard or CLI (never commit values):



```bash

eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value "https://YOUR_PROJECT.supabase.co"

eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "YOUR_ANON_KEY"

eas secret:create --scope project --name EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID --value "....apps.googleusercontent.com"

```



Copy placeholders from `.env.example` for local `expo start`.



## 3. Build profiles (`eas.json`)



| Profile | Use |

|---------|-----|

| `development` | Dev client, internal distribution |

| `preview` | APK / internal TestFlight |

| `production` | Store builds (auto-increment version) |



```bash

eas build --profile preview --platform android

eas build --profile preview --platform ios

eas build --profile production --platform all

```



## 4. Submit to stores



Configure Apple IDs and Play service account locally (not in git):



```bash

# iOS — set appleId, ascAppId, appleTeamId in eas.json submit.production.ios

# Android — place google-play-service-account.json in mobile/ (gitignored)

eas submit --platform ios --profile production

eas submit --platform android --profile production

```



## 5. Deep links



App scheme: `medscope-academy`  

Auth callback: `medscope-academy://auth/callback`



Add the same redirect URL in **Supabase Auth → URL Configuration → Redirect URLs**.



## 6. Google OAuth



See [GOOGLE-OAUTH.md](./GOOGLE-OAUTH.md) for client IDs and Supabase provider setup.

