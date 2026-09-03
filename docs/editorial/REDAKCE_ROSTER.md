# Redakce roster — personas, desks, crons

Exact counts from source of truth in the repo (branch audit). Cross-check:
`lib/ecosystem/editorial/personas.ts`, `desks.ts`, `lib/editorial/writer-agents.ts`,
`lib/editorial/units.ts`, `lib/ecosystem/autonomous.ts`, `.github/workflows/cloudflare-cron.yml`.

## Summary counts

| Layer | Count | Source |
|-------|------:|--------|
| Ecosystem journalists | **9** | `EDITORIAL_PERSONAS` role=`journalist` |
| Ecosystem editors | **8** | role=`editor` |
| Language reviewers | **6** | role=`language_reviewer` |
| Compliance reviewers | **3** | role=`compliance_reviewer` |
| Image curators | **2** | role=`image_curator` |
| **Ecosystem personas (total)** | **28** | all active |
| Public writers per locale | **20** | 5 categories × 4 senior specialists, native language |
| Public writers total | **420** | 21 locales × 20 |
| v27 audience AI writers | **4** | `V27_AI_WRITERS` (public/student/physician/b2b) |
| v26 writing-style personas | **7** | `AUTHOR_PERSONAS` (tone styles, not bylines) |
| Editorial author units | **14** | `EDITORIAL_UNITS` (public bylines) |
| Desks (all locales) | **21** | `EDITORIAL_DESKS` = `GLOBAL_LOCALES` (incl. pt, pt-BR) |
| Primary desks (daily enqueue) | **13** | `PRIMARY_EDITORIAL_LOCALES` |
| Syndication hubs | **3** | cs, en, en-US |

### How to read “writers”

- **Journalists (9)** — autonomous multi-locale content personas in the ecosystem redakce.
- **Public writers (20)** — 4 senior specialists per magazine category on `/api/cron/public-articles`.
- **v27 writers (4)** — audience-scoped AI prompts (not the daily cron roster).
- Do **not** sum all layers as unique humans; they overlap by role. For “who writes every day”:
  **20 public writers + 9 ecosystem journalists** (enqueue/persona assignment).

---

## Ecosystem personas (28)

### Journalists — 9

| ID | Locales | Topics | Unit |
|----|---------|--------|------|
| `journalist-longevity-cz` | cs, sk | longevity | medscope_cz_research_desk |
| `journalist-lifestyle-cz` | cs | lifestyle | medscope_cz_odborna |
| `journalist-seniors-cz` | cs, sk | seniors | medscope_cz_klinicka |
| `journalist-trending-cz` | cs | trending | medscope_cz_info_team |
| `journalist-longevity-en` | en, en-US | longevity | medscope_global_health |
| `journalist-lifestyle-de` | de | lifestyle, longevity | medscope_international_research |
| `journalist-eu-romance` | fr, es, it, ro, hu, pl | all 4 topics | medscope_international_research |
| `journalist-east-asia` | zh-CN, ja, ko, vi, id | all 4 topics | medscope_global_health |
| `journalist-slavic` | ru, uk, be | all 4 topics | medscope_global_health |

### Editors — 8

| ID | Locales | Unit |
|----|---------|------|
| `editor-chief-cz` | cs, sk | medscope_global_editorial_board |
| `editor-chief-en` | en, en-US, fr, es, it, pl, de, ru, uk, zh-CN, ja | medscope_global_editorial_board |
| `editor-longevity` | cs, en, en-US, de, fr, es, pl, ru | medscope_evidence_synthesis |
| `editor-lifestyle` | cs, sk, en, en-US | medscope_cz_odborna |
| `editor-clinical` | cs, sk, en | medscope_cz_klinicka |
| `editor-prevention` | cs, sk, en, en-US | medscope_clinical_insights |
| `editor-interviews` | cs, sk, en | medscope_cz_info_team |
| `editor-diplomacy-cz` | cs, sk | medscope_global_editorial_board |

### Language reviewers — 6

| ID | Locales |
|----|---------|
| `lang-reviewer-cz` | cs |
| `lang-reviewer-sk` | sk |
| `lang-reviewer-en` | en, en-US |
| `lang-reviewer-de` | de |
| `lang-reviewer-eu` | fr, es, it, pl, ro, hu |
| `lang-reviewer-intl` | ru, uk, be, zh-CN, ja, ko, vi, id |

### Compliance reviewers — 3

| ID | Locales | Unit |
|----|---------|------|
| `compliance-medical-cz` | cs, sk | medscope_clinical_insights |
| `compliance-medical-en` | en + EU/Asia set | medscope_clinical_insights |
| `compliance-legal-global` | all 19 locales | medscope_scientific_office |

### Image curators — 2

| ID | Locales | Unit |
|----|---------|------|
| `image-curator-global` | all 19 | medscope_global_editorial_board |
| `image-curator-cz` | cs, sk | medscope_cz_odborna |

---

## Public writers (20) — daily production cron

Four senior specialists per category (`practice`, `research`, `trends`, `field`).
No personal portraits or bylines — editorial geometry only.

| Desk | Topic | Specialist IDs |
|------|-------|----------------|
| `writer1` | Životní styl | `writer1-practice` … `writer1-field` |
| `writer2` | Nemoci | `writer2-practice` … `writer2-field` |
| `writer3` | Prevence | `writer3-practice` … `writer3-field` |
| `writer4` | Rozhovory | `writer4-practice` … `writer4-field` |
| `writer5` | Dlouhověkost | `writer5-practice` … `writer5-field` |

Endpoint: `/api/cron/public-articles`.
Default: `DEFAULT_PUBLIC_WRITER_LIMIT` = 4 articles/writer → target **80**/day (`DAILY_PUBLIC_ARTICLE_TARGET`).
Each article is reviewed by multiple MedScopeGlobal editors (diplomatic, legal, medical, language).

---

## Desks — 19 total / 13 primary

| Desk ID | Locale | Primary | Hub | max/day |
|---------|--------|:-------:|:---:|--------:|
| `desk-cz` | cs | ✓ | ✓ | 5 |
| `desk-sk` | sk | ✓ | | 4 |
| `desk-pl` | pl | ✓ | | 3 |
| `desk-de` | de | ✓ | | 4 |
| `desk-fr` | fr | ✓ | | 3 |
| `desk-it` | it | ✓ | | 3 |
| `desk-es` | es | ✓ | | 3 |
| `desk-ro` | ro | | | 2 |
| `desk-hu` | hu | | | 2 |
| `desk-ru` | ru | ✓ | | 3 |
| `desk-uk` | uk | ✓ | | 2 |
| `desk-be` | be | | | 2 |
| `desk-zh-cn` | zh-CN | ✓ | | 3 |
| `desk-ja` | ja | ✓ | | 2 |
| `desk-ko` | ko | | | 2 |
| `desk-vi` | vi | | | 2 |
| `desk-id` | id | | | 2 |
| `desk-en` | en | ✓ | ✓ | 4 |
| `desk-en-us` | en-US | ✓ | ✓ | 5 |

Primary list: cs, sk, pl, de, fr, es, it, en, en-US, ru, uk, zh-CN, ja.

---

## Editorial author units — 14

**Global (8):** `medscope_global_editorial_board`, `medscope_international_research`,
`medscope_clinical_insights`, `medscope_global_health`, `medscope_scientific_office`,
`medscope_ai_editorial`, `medscope_medical_knowledge_lab`, `medscope_evidence_synthesis`

**CZ (6):** `medscope_cz_odborna`, `medscope_cz_klinicka`, `medscope_cz_analyzy`,
`medscope_cz_klinicky_obsah`, `medscope_cz_research_desk`, `medscope_cz_info_team`

---

## Cron map

### Dispatcher — `.github/workflows/cloudflare-cron.yml`

Schedules (UTC): `0 4/6/7/8/12/16/20 * * *` + `workflow_dispatch`.

| Path | Method | Role |
|------|--------|------|
| `/api/cron/ingest` | GET | Ingest pipeline |
| `/api/cron/public-articles` | GET | **20 public writers** generate articles |
| `/api/cron/public-osveta-daily` | GET | Public health video/osvěta |
| `/api/cron/v25-enterprise` | GET | Enterprise content |
| `/api/cron/marketing` | GET | Marketing |
| `/api/cron/academy-daily` | GET | Academy |
| `/api/cron/v43-health-monitor` | GET | Health monitor |
| `/api/cron/ecosystem-mediflow` | GET | MediFlow daily reset (`0 4`) |
| `/api/cron/ecosystem-editorial-queue` | GET | Enqueue primary desks (`0 5`) |
| `/api/cron/ecosystem-generate-articles` | GET | Enqueue generate + point at public-articles (`0 6`) |
| `/api/cron/ecosystem-syndicate` | GET | Pending syndications (`0 14`) |
| `/api/ecosystem/editorial/images` | **POST** | Image curator batch (`0 10`) |

> **Fix (2026-08):** dispatcher previously used `POST` for all paths → **405** on GET-only
> cron routes. Now uses GET except images (POST-only batch).

### Autonomous schedule — `AUTONOMOUS_SCHEDULE`

| Task | Cron (UTC) | Endpoint / behavior |
|------|------------|---------------------|
| `mediflow-daily-reset` | `0 4 * * *` | `/api/cron/ecosystem-mediflow` — real reset |
| `editorial-queue` | `0 5 * * *` | `/api/cron/ecosystem-editorial-queue` — persists queue |
| `generate-articles` | `0 6 * * *` | `/api/cron/ecosystem-generate-articles` — queue + legacy public-articles |
| `generate-vip-content` | `0 7 * * 1` | Enqueues VIP jobs to `editorial_queue` (LLM deferred) |
| `translate-content` | `0 8 * * *` | Enqueues translate jobs (LLM deferred) |
| `add-images` | `0 9 * * *` | Queue image jobs + curated suggestion batch |
| `editorial-images` | `0 10 * * *` | `/api/ecosystem/editorial/images` |
| `seo-optimize` | `0 10 * * *` | Enqueues SEO jobs |
| `generate-affiliate-boxes` | `0 11 * * *` | Enqueues affiliate jobs |
| `generate-donation-cta` | `0 12 * * *` | Enqueues donation CTA jobs |
| `syndicate-articles` | `0 14 * * *` | `/api/cron/ecosystem-syndicate` — `article_syndications` + queue |
| `place-ads` | `0 */4 * * *` | Enqueues ad placement jobs |
| `switch-locale` | `0 * * * *` | Client geolocation — server **noop** |

Invoke: `POST /api/ecosystem/autonomous` with `{ "task": "…" }` + Bearer `CRON_SECRET`.

### Related content crons (not in cloudflare-cron.yml list)

| Path | Typical use |
|------|-------------|
| `/api/cron/daily-autopublish` | Autopublish |
| `/api/cron/v25-images` | Legacy image pass |
| `/api/cron/v26-autonomous` | v26 autonomous rewrite |
| `/api/cron/v26-rewrite` | Batch rewrite |
| `/api/cron/newsletter-generate` | Newsletter |
| `/api/cron/v19-daily-briefs` | Daily briefs |

---

## Production probe (401 = route exists + auth required)

Probed `https://medscopeglobal.com` with invalid Bearer:

| Endpoint | GET | POST |
|----------|-----|------|
| `/api/cron/ecosystem-editorial-queue` | 401 | 401 |
| `/api/cron/ecosystem-generate-articles` | 401 | 401 |
| `/api/cron/ecosystem-syndicate` | 401 | 401 |
| `/api/cron/ecosystem-mediflow` | 401 | 401 |
| `/api/ecosystem/editorial/images` | 200 (status) | 401 |
| `/api/ecosystem/autonomous` | 200 (catalog) | 401 |
| `/api/cron/public-articles` | 401 | 405 |
| `/api/cron/ingest` | 401 | 405 |
| `/api/cron/public-osveta-daily` | 401 | 405 |
| `/api/cron/marketing` | 401 | 405 |
| `/api/cron/academy-daily` | 401 | 405 |
| `/api/cron/v43-health-monitor` | 401 | 405 |
| `/api/cron/v25-enterprise` | 401 | 405 |

Public catalog: `GET /api/ecosystem/autonomous`, `GET /api/ecosystem/editorial/desks`.

---

## Blockers / deferred execution

| Need | Why |
|------|-----|
| `CRON_SECRET` in GitHub Actions + Worker | Dispatcher auth; without it calls fail |
| `SUPABASE_SERVICE_ROLE_KEY` on Worker | Persist `editorial_queue` / `article_syndications` / image suggestions |
| LLM keys (Groq/OpenAI/Gemini) | Actual article writing, translate, VIP copy |
| `UNSPLASH_ACCESS_KEY` (optional) | Broader image pool beyond curated assets |
| Migrations applied | `editorial_queue`, `article_syndications`, `article_image_suggestions` |

Without service role: crons still return `ok` with in-memory `queued` items and `persisted: 0`.
Without AI keys: queue fills but writers do not rewrite/adapt in the ecosystem step;
**production article generation remains on `/api/cron/public-articles`**.

See also: `docs/editorial/autonomous-redakce.md`.
