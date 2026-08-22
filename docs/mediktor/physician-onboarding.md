# MeDiktor physician onboarding

Passwordless OTP so doctors reach dictation in ~30–60 seconds.

## Current flow (live)

1. **Welcome** — e-mail-first, no password
2. **Contact** — e-mail required; phone optional (stored after verify)
3. **OTP** — 6-digit code via e-mail (SMS only if Twilio env is set)
4. **KYC (background)** — licence / IČO / work e-mail / ID photo, or skip
5. **SW link** — export / webhook / HL7 / FHIR stub, or skip
6. **Mic tooltips** → main dictation screen (`Povolit mikrofon`)

Entry: `/app/dokumentace` (PWA). Marketing: `/mediktor`. Install guide: `/mediktor/stahnout`.

## APIs

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/mediktor/otp/request` | Create + send OTP |
| POST | `/api/mediktor/otp/verify` | Verify code, create session |
| GET\|POST | `/api/mediktor/verification` | KYC status / submit |
| GET\|POST | `/api/mediktor/integration` | SW link status / save |
| GET\|PATCH | `/api/mediktor/onboarding` | Onboarding step / complete |

## Migration

`supabase/migrations/20260811210000_mediktor_onboarding.sql`

Tables: `mediktor_otp_challenges`, `mediktor_doctor_verifications`, `mediktor_integrations`, `mediktor_integration_deliveries`.

Apply notes: [apply-onboarding-migration.md](./apply-onboarding-migration.md).

## Email OTP

Production sends via Cloudflare Email Service Workers binding (`send_email` → `EMAIL`) from `noreply@mail.medscopeglobal.com` when the Worker is deployed with that binding.

Optional fallbacks: `SENDGRID_API_KEY` or SMTP (`SMTP_HOST` / `SMTP_USER` / `SMTP_PASS`) — see `.env.example`.

## SMS gap (optional)

Without `TWILIO_ACCOUNT_SID` + `TWILIO_AUTH_TOKEN` + `TWILIO_FROM_NUMBER`:

- phone-only OTP returns `422 EMAIL_REQUIRED_FOR_OTP`
- onboarding UI is e-mail-first; phone is optional and stored after e-mail OTP
- account tab (`?tab=ucet`) shows physician verification status prominently

## Native stores (optional)

Without `NEXT_PUBLIC_MEDIKTOR_APP_STORE_URL` / `NEXT_PUBLIC_MEDIKTOR_PLAY_STORE_URL`:

- `/mediktor/stahnout` is a step-by-step PWA install guide (iOS Safari / Android Chrome) with cancelable auto-open
- dual QRs on `/mediktor` decode to `/mediktor/stahnout?store=ios|android`
- flyer / static `download-qr.png` decodes to `https://medscopeglobal.com/mediktor/stahnout`

## Microphone

- Response header (middleware): `Permissions-Policy: microphone=(self)`
- Client helpers: `lib/lekari/dokumentace/mic.ts` (mobile-safe `getUserMedia`, iOS mime types)
- UI: grant CTA → system prompt → record (auto-start on PWA / install tip)

## Host / API

Canonical host is apex `medscopeglobal.com`. Cloudflare redirects `www` with **308** (keeps POST). API same-origin allows both hosts.

## Support

+420 733 635 144
