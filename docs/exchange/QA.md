# MedScope B2B Exchange — QA scenarios

Run automated guards: `pnpm exec tsx scripts/exchange-check.ts`.

## A) Functional

| Scenario | Expect |
|---|---|
| Register organisation `/exchange/onboard` | Stored / demo accepted; Basic plan |
| Activate subscription `POST /api/exchange/subscribe` `{plan:pro}` | Cookie set; dashboard Pro |
| Insert product `/exchange/listing/new` | `availability_region` required |
| Insert service | Same region ENUM |
| Insert buyer inquiry (no login) | `POST /api/exchange/contact` 200 |
| Basic inquiries | Redacted name/email/phone; cannot reply |
| Pro/Enterprise inquiries | Full contacts; reply 200 |
| Direct contact | Form only on listing; no public mailto |
| Regional filter | Catalogue `?regions=EU` |
| i18n EN/CS/DE/IT/ES/FR/PL/SK/HU | Locale prefix + copy packs |
| Legal per language | `/exchange/legal/*` CS+EN bodies, others EN fallback |
| Enterprise microsite | `/exchange/m/pacific-lab-network` |
| API | health, listings, contact, inquiries, reply 402, import 402, ads/order 402, subscribe, emails, metrics, observability |

## B) Security

| Scenario | Expect |
|---|---|
| SQL injection in listing search | Parameterised Supabase / Zod |
| XSS in inquiry message | `sanitizeText` |
| CSRF | `assertSameOrigin` |
| Brute-force login | Existing auth rate limit |
| Rate limiting | `withApiGuard` 429 |
| RBAC | Admin approve only |
| Inquiries without subscription | Redacted + reply 402 |
| Contacts without subscription | Null email/phone |

## C) UX

Pricing (Basic free), onboarding, anonymous teasers, CTAs to Pro, mobile `100dvh` chrome.

## D) Performance (manual / staging)

Load ~500 RPS and DB stress are staging-only. Local check: health + catalogue TTFB.
