# Google OAuth — MedScope Academy Mobile

## Redirect URLs

| Environment | URL |
|-------------|-----|
| Mobile deep link | `medscope-academy://auth/callback` |
| Web (Supabase) | `https://medscopeglobal.com/auth/callback` |
| Local web dev | `http://localhost:3000/auth/callback` |

Add **all** of these in:

1. **Supabase Dashboard** → Authentication → URL Configuration → Redirect URLs
2. **Google Cloud Console** → APIs & Services → Credentials → OAuth 2.0 Client IDs

## Google Cloud clients

Create three OAuth clients (package `com.medscopeglobal.academy`):

| Type | Purpose |
|------|---------|
| **Web** | Supabase Google provider (copy Client ID + Secret to Supabase) |
| **iOS** | Bundle ID `com.medscopeglobal.academy` |
| **Android** | Package + SHA-1 from debug/release keystore |

Map to Expo env vars (see `.env.example`):

- `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`
- `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`
- `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID`

## Supabase Auth callback paths

Supabase handles the OAuth exchange at:

```
https://<project-ref>.supabase.co/auth/v1/callback
```

Your app receives tokens via `redirectTo` in `signInWithOAuth` (`mobile/lib/auth.ts`):

```ts
const redirectUrl = Linking.createURL("auth/callback");
// → medscope-academy://auth/callback
```

The screen `app/auth/callback.tsx` parses tokens and calls `supabase.auth.setSession`.

## Magic link

Magic links use the same `emailRedirectTo: redirectUrl` — ensure the scheme is registered in `app.json` (`scheme: medscope-academy`).

## Testing

1. `npx expo start` in `mobile/`
2. Open Auth tab → Google sign-in
3. After redirect, confirm session on Profile tab
