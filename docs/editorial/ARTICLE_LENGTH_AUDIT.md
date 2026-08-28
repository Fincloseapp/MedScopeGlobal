# Article length audit — Czech public articles
Generated: 2026-08-28T06:18:10.010Z
Data source: **production-scrape** (https://medscopeglobal.com)
Supabase note: invalid_api_key
## Summary
| Metric | Value |
|--------|------:|
| Articles analyzed | 26 |
| Min words | 13 |
| Avg words | 1027 |
| Median (p50) | 1259 |
| p75 | 1430 |
| Max words | 1576 |
| Under 300 words | 6 (23.1%) |
| Under 800 words | 7 (26.9%) |
| Under config min (1100) | 8 (30.8%) |
## By generation path
| Path | Count | Avg words | Min | Max | % <300 | % <800 |
|------|------:|----------:|----:|----:|-------:|-------:|
| public-cron+deterministic-depth | 15 | 1369 | 828 | 1576 | 0% | 0% |
| public-articles-cron | 4 | 1239 | 1178 | 1340 | 0% | 0% |
| seed-static | 4 | 231 | 111 | 580 | 75% | 100% |
| unknown | 3 | 95 | 13 | 137 | 100% | 100% |
## Worst offenders (shortest)
| Words | Path | Slug | Title |
|------:|------|------|-------|
| 13 | unknown | `unscheduled-procedural-sedation-multidisciplinary-delphi-consensus-guidelines-part-1-principles-oversight-and-quality-monitoring-approved-by-the-acep-board-of-directors-april-29-2026` | Zdravotní zpráva: Zahraniční zdravotnická zpráva |
| 111 | seed-static | `verejnost-prevence-screening-a-ockovani` | Prevence: screening a očkování v praxi |
| 111 | seed-static | `verejnost-rozhovor-kardiolog-prevence-srdce` | Rozhovor s kardiologem: prevence srdečních onemocnění v každ |
| 123 | seed-static | `verejnost-nemoci-kdy-vyhledat-lekare` | Symptomy: kdy vyhledat lékaře a kdy počkat |
| 136 | unknown | `ministerstvo-zdravotnictv-zmnilo-3-vzvu-npo` | Ministerstvo zdravotnictví změnilo 3. výzvu NPO |
| 137 | unknown | `konference-nikez-2026-bude-online-registrace-sputna` | Konference NIKEZ 2026 bude online – registrace spuštěna |
| 580 | seed-static | `verejnost-zivotni-styl-vyziva-bez-extremu` | Vyvážená strava bez extrémů: středomořský talíř v české kuch |
| 828 | public-cron+deterministic-depth | `verejnost-prevence-2026-08-14-ochrana-pred-rakovinou-co-je-dostupne-v-cesku` | Ochrana před rakovinou: co je dostupné v Česku |
| 1178 | public-articles-cron | `verejnost-zivotni-styl-2026-08-08-stredomorsky-talir-na-ceske-zahrade-kouzlo-vyvazene-stravy-bez-dietnich-honicek` | Středomořský talíř na české zahradě: Chuť léta, zdraví po ce |
| 1189 | public-cron+deterministic-depth | `verejnost-zivotni-styl-2026-07-26-biologicky-vek-versus-kalendarni-co-ovlivnite-dnes` | Jak zlepšit své zdraví: 7‑týdenní plán pro každého |
| 1200 | public-articles-cron | `verejnost-zivotni-styl-2026-07-28-jak-stres-z-prace-ovlivnuje-imunitu-role-dechove-cviceni-a-rezimu-dne` | Když šéf tlačí a termíny pálí: Jak si ubránit imunitu před p |
| 1237 | public-cron+deterministic-depth | `verejnost-prevence-2026-07-25-biomarkery-zdravi-glukoza-lipidy-a-vitamin-d-co-si-nechat-vysvetlit-u-lekare` | Biomarkery zdraví: glukóza, lipidy a vitamín D – co si necha |
| 1239 | public-articles-cron | `verejnost-zivotni-styl-2026-08-09-myty-o-pitnem-rezimu-v-zime-proc-se-po-douscich-caje-citite-unaveni` | Zimní pohoda vs. dehydratace: Proč vás hřeje čaj, ale zárove |
| 1259 | public-cron+deterministic-depth | `verejnost-zivotni-styl-2026-07-05-stredomorsky-talir-v-ceske-kuchyni-vyvazena-strava-bez-extremu` | Středomořský talíř v české kuchyni: vyvážená strava bez extr |
| 1311 | public-cron+deterministic-depth | `verejnost-zivotni-styl-2026-07-03-stredomorsky-talir-v-ceske-kuchyni-vyvazena-strava-bez-extremu` | Středomořská dieta v Česku: Jak si ji přizpůsobit bez exotik |
## Root cause notes
- **public-articles-cron** (`cron/public/fetch-public-articles.mjs` → `lib/v25/writers/run-public-writers.mjs`): daily LLM generation; v26.3 prompts target 800–1500 words with `expandPublicArticleIfShort` when draft < min.
- **persona-fallback / compact Groq**: when Gemini/OpenAI fail or return 413, `buildCompactPrompts` + `buildPersonaFallbackHtml` produce shorter templates (~150–350 words) unless expansion succeeds.
- **deterministic-depth**: `appendMagazineDepthSections` injects boilerplate sections when LLM expansion is rate-limited — can reach ~800+ words without unique editorial quality.
- **seed-static / demo-fallback**: `lib/verejnost/seed-public-articles.ts` and `demo-magazine-articles.ts` — intentionally short demo cards (~80–180 words); still appear in `/articles` when mixed with DB rows.
- **editorial-queue**: `editorial_queue` cron scaffold enqueues tasks; most published Czech lay content today comes from v25 writers, not queue completion.
- **v19-brief-ingest**: legacy brief rubric (`aktualni-zpravy`) — archived after 45 days per `lib/v20/content-rules.ts`.
## Config targets
- Canonical min/target: `lib/v25/writers/writer-base.mjs` — min **1100**, target **1400** words.
- Regenerate short: `node scripts/regenerate-short-public.mjs --min-words=800 --expand`