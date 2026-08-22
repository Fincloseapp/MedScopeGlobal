# MeDiktor changelog

## 2026-08-17 — Flyer hero QR crisp composite

- Regenerated `hero-flyer.png` QR from pre-fix backup: module-aligned ECC Q, larger white card/quiet zone, target `/mediktor/stahnout`.
- Cache-bust `?v=20260817b` on hero-flyer + download-qr; `verify-prod-qr.cjs` crop coords updated.
- Docs (`flyer.md`) aligned with live QR targets.
- Moved MeDiktor `themeColor` from metadata → `viewport` (Next 15 warning on /mediktor + /app/dokumentace).

## 2026-08-17 — Store QR + predplatne copy

- Live OTP (apex + www 308 + Origin www→Host apex) and `Permissions-Policy: microphone=(self)` re-confirmed.
- Fixed store iPhone/Android QR: nested `&store=` inside `target` was stripped at the edge — sibling `install`/`store` params + merge on the QR API.
- Predplatne intro no longer calls the product “Dokumentace”; card remains “MeDiktor od MedScopeGlobal”.
- Flyer/`download-qr.png` still → `/mediktor/stahnout`; default `public=1` QR → `/app/dokumentace?source=qr`.

## 2026-08-17 — OTP www/apex fix

- Cloudflare Dynamic Redirect `www → apex` changed **301 → 308** so POST OTP survives the hop.
- `assertSameOrigin` hard-allows `medscopeglobal.com` + `www.medscopeglobal.com` (Origin www + Host apex).
- Live smoke: `Permissions-Policy: microphone=(self)`, flyer QR → `/mediktor/stahnout`, OTP POST 200 via www follow.

## 2026-08-13 — Live verify + gate polish

- Confirmed production `Permissions-Policy: microphone=(self)` on `/app/dokumentace` (single header via middleware).
- QR decode OK: `/mediktor`, store QRs `/mediktor/stahnout?store=ios|android`, flyer `download-qr.png` → `/mediktor/stahnout`.
- Gate CTA is e-mail OTP (restart onboarding); ineligible Zápis/Historie shows gate instead of force-redirect to Účet.
- Docs + `.env.example` placeholders for Twilio / App Store / Play (still unset in production).

## 2026-08-11 — Passwordless physician onboarding

- Added email OTP (passwordless) entry into MeDiktor PWA; password login kept for existing users.
- Background doctor verification (ID OCR stub, licence, facility IČO, work email) with pending/verified/rejected.
- Ambulatory/hospital SW connector: export, webhook/API, HL7/FHIR stubs; push on note save.
- Website: big Stáhnout CTA, dual App Store / Play QRs (or smart `/mediktor/stahnout`), ambulatory + hospital sections.
- In-app "Jak začít" (4 steps) + first-run tooltips.
- SMS not wired yet — documented gap; email OTP is the shipping path.