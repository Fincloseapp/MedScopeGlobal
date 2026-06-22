# Deep Links — MedScope Academy Mobile

Expo Router app scheme: **`medscope-academy`**

## Auth callback

| Route | Deep link | Purpose |
|-------|-----------|---------|
| OAuth / magic link return | `medscope-academy://auth/callback` | Supabase `redirectTo` target after Google OAuth |
| Auth hub | `medscope-academy://auth` | Sign-in screen |

Configured in `mobile/app.json`:

```json
"scheme": "medscope-academy"
```

Handler: `mobile/app/auth/callback.tsx` — parses `#access_token` / `?code=` from the redirect URL and calls `supabase.auth.setSession` or `exchangeCodeForSession`.

## App screens

| Screen | Deep link |
|--------|-----------|
| Home | `medscope-academy://` |
| Courses | `medscope-academy://courses` |
| Sync | `medscope-academy://sync` |
| Profile | `medscope-academy://profile` |

## Web → app handoff

Production web can link to the app with universal links (future) or custom scheme:

```
medscope-academy://courses
medscope-academy://auth/callback
```

For marketing e-mails, prefer HTTPS fallbacks:

```
https://medscopeglobal.com/academy
https://medscopeglobal.com/academy/courses
```

## Supabase redirect allowlist

Add to **Supabase → Authentication → URL Configuration → Redirect URLs**:

```
medscope-academy://auth/callback
exp://127.0.0.1:8081/--/auth/callback
```

(`exp://` is for Expo Go local dev.)

## Google OAuth

See [GOOGLE-OAUTH.md](./GOOGLE-OAUTH.md) — all three OAuth clients must include the mobile callback in authorized redirect URIs where applicable.

## Testing

```bash
# iOS Simulator
xcrun simctl openurl booted "medscope-academy://auth/callback#access_token=TEST&refresh_token=TEST"

# Android adb
adb shell am start -a android.intent.action.VIEW -d "medscope-academy://courses"
```

Use real tokens from a dev OAuth flow — stub tokens above will fail session setup (expected).
