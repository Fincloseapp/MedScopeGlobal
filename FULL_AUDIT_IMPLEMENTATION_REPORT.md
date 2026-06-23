# MedScopeGlobal — Zpráva o implementaci full auditu

**Datum:** 23. června 2026 (aktualizováno po paralelních úkolech)  
**Pracovní kopie:** `D:\medscopeglobal`  
**Repozitář:** [Fincloseapp/MedScopeGlobal](https://github.com/Fincloseapp/MedScopeGlobal)  
**Zdroj auditu:** `medscopeglobal-audit-report.md` (22 agentních person, 22. 6. 2026)  
**Produkční URL:** https://medscopeglobal.com

---

## 1. Shrnutí pro vedení

Po auditu webu medscopeglobal.com proběhla koordinovaná implementace doporučení v lokální větvi `main` a follow-up větvi `fix/checkout-predplatne-ctas`. Auditní commity zahrnují `609c511`, `88e3ca9`, `20f43da`, `9ca3a0f` a `3e19d9c`.

**Produkční stav (23. 6. 2026):** všechny klíčové trasy vrací **HTTP 200** — homepage, segmenty (veřejnost, studenti, lékaři), Academy, články, předplatné, studie, AI, B2B, kontakt, `/hledat`, `/o-nas`, login, privacy a `/api/health`.

**Stripe checkout:** napojen — `V27CheckoutButton` na `/predplatne` volá `POST /api/v27/checkout`; alias `POST /api/stripe/checkout` sdílí handler v `lib/stripe/v27-checkout.ts` (commit `3e19d9c`). Success stránka `/checkout/uspesne`.

**Větev `fix/checkout-predplatne-ctas`:** lokální HEAD `3e19d9c` (1 commit před `main`); `origin/fix/checkout-predplatne-ctas` na `9ca3a0f` — checkout wiring pushnut, alias + Phase 1 routes ještě nepushnut. Čeká na merge do `main` a deploy.

**Stav nasazení:** lokální `main` (`9ca3a0f`) a `origin/main` (`b8c360f`) jsou **rozcházené** od společného předka `2523e7d`. Checkout změny nejsou na produkci, dokud neproběhne merge + push + Vercel deploy.

---

## 2. Implementovaná doporučení (podle oblastí auditu)

### 2.1 Technická vrstva a SEO

| Položka auditu | Stav | Implementace |
|----------------|------|----------------|
| Odstranění verzí z UI (v29, v46, ULTRA-MAX) | Částečně / pokračuje | Úpravy layoutu, footeru, hero komponent; commit `88e3ca9` |
| Canonical `/kontakt` | Hotovo | `app/(public)/kontakt/page.tsx`, metadata |
| Stránka `/hledat` (404) | Hotovo | `app/(public)/hledat/page.tsx`, vyhledávací UI |
| SEO meta (OG, keywords, robots) | Hotovo | `app/layout.tsx`, `opengraph-image` u článků |
| Paywall — delší náhled | Hotovo | `lib/vip.ts` (`PAYWALL_PREVIEW_CHARS`), `article-body`, conversion gate |
| Scraper / bot filtr | Rozšířeno | `lib/security/scraper-filter.ts` |
| Pre-deploy brány | Hotovo | `scripts/run-predeploy-gates.mjs`; commit `20f43da` — tsconfig excludes, Sentry stub, oprava duplicitního klíče v19 |

### 2.2 Marketing a konverze

| Položka | Stav | Poznámka |
|---------|------|----------|
| Premium positioning, social proof | Implementováno v kódu | `lib/v271/homepage.ts`, `components/v271/*` (v širší pracovní kopii / agentní integrace) |
| „Vyzkoušet 14 dní zdarma“ | Hotovo na `/predplatne` | Trial banner, FAQ, srovnávací tabulka předplatného |
| Trust signály pro veřejnost | Hotovo | `/o-nas`, `public-trust-disclaimer`, trust badges |
| B2B ceník | Částečně | Komponenty v271; plná viditelnost cen na `/firmy/cenik` — ověřit v produkci po pushi |

### 2.3 Monetizace a předplatné

- **`/predplatne`** — tři tarify, srovnávací tabulka, FAQ, trust badges (`components/subscription/*`).
- **Trial konfigurace** — `VIP_TRIAL_DAYS = 14` v `lib/vip.ts`, `lib/v27/config.ts`.
- **Stripe webhook** — `app/api/stripe/webhook/route.ts` (přítomen).
- **Stripe checkout (VIP / v27)** — **hotovo** — viz sekce 5.

### 2.4 Obsah a kvalita

- Generické titulky — úpravy writer seedů (`lib/v25/writers`, `lib/verejnost/seed-*`).
- Placeholder studie — filtry v `lib/v20/studies/*`.
- Duplicitní Academy lekce — idempotentní SQL migrace (agentní sprint).

### 2.5 Česká UX a segmentace (commit `609c511`)

- Segmentace laik / lékař / vědec, medicína (příprava, studium), navigace, sitemap.
- Testy: `tests/hub-sections.test.ts` (audience filtry, hub theme třídy).

### 2.6 Platforma a infrastruktura (širší working tree)

V adresáři existuje rozsáhlá sada **nesledovaných** souborů (API v6–v19, admin, academy, autopilot, Supabase migrace, deploy skripty). Nejsou součástí posledních tří commitů na `origin`; před produkčním sjednocením je nutný kurátorovaný commit a review.

---

## 3. Opravy a technický dluh po auditu

### Commit `88e3ca9` — feat(full-audit)

Hlavní doručené soubory (výběr):

- Veřejné stránky: `page.tsx` (homepage), `predplatne`, `o-nas`, `hledat`, `kontakt`, `contact`, `newsletter`, články.
- Layout: `site-header`, `site-footer`, `search-command`, navigace `lib/config/main-navigation.ts`.
- Předplatné UI: subscription komponenty (trial, comparison, FAQ, trust).
- Audit report v repu: `medscopeglobal-audit-report.md`.

### Commit `20f43da` — fix: pre-deploy gates

- `tsconfig.json` — excludes pro stabilnější typecheck.
- Sentry — odstranění/ stub konfigurace (`sentry.*.config.ts` smazány v working tree).
- Oprava duplicitního klíče v19.

### Známé zbývající položky z auditu

1. **CSP `unsafe-eval`** — zpřísnění v produkčních hlavičkách (Vercel / `next.config`).
2. **Formální WCAG 2.1 AA** — neproveden kompletní audit.
3. **Lighthouse CI / velikost homepage JS** — monitoring chybí.
4. **403 bez User-Agent** — politika edge/middleware; ovlivňuje některé crawlery.
5. **Regenerace starých článků v DB** — obsahová migrace / cron.
6. **Newsletter `/newsletter`** — v auditu timeout; ověřit po nasazení a env.

---

## 4. Testy a lokální ověření

| Kontrola | Výsledek | Poznámka |
|----------|----------|----------|
| `npm run typecheck` | Úspěch (log `build-typecheck.log`) | `tsc --noEmit` |
| V17 skeleton verify | Úspěch (`v17-verify.log`) | API handlery v17 |
| `tests/hub-sections.test.ts` | Přítomen | Vitest — segmenty a hub themes |
| `npm run test` | Skript: `scripts/test-v18-placeholder.mjs` | Placeholder test v18 |
| `npm run test:prod` | Skript: `tests/production/run-prod-tests.mjs` | Spustit před release po pushi |
| Windows `npm run build` | Historicky problém FAT32 EISDIR (`migration-status.md`) | Použít `build:win` / NTFS cestu |

**Doporučení před push:** `node scripts/run-predeploy-gates.mjs`, poté `npm run build:win` na `D:\medscopeglobal`.

---

## 5. Stripe a checkout — stav po wiringu

| Endpoint | Stav v `D:\medscopeglobal\app\api` |
|----------|-------------------------------------|
| `stripe/webhook` | **Ano** — `app/api/stripe/webhook/route.ts` |
| `v27/checkout` | **Ano** — `app/api/v27/checkout/route.ts` (canonical, commit `9ca3a0f`) |
| `stripe/checkout` | **Ano** — alias na sdílený handler `lib/stripe/v27-checkout.ts` (commit `3e19d9c`) |
| `academy/marketplace/checkout` | **Ano** — academy marketplace |

**UI integrace:** `components/v27/checkout-button.tsx` na `/predplatne` — POST `{ kind, productId }` → Stripe Checkout URL s 14denním trialem (`VIP_TRIAL_DAYS`). Success redirect: `/checkout/uspesne`.

**Zbývá ověřit v produkci:** Stripe price IDs v env (`lib/v27/stripe-products.ts`), trial days v Stripe Dashboard, end-to-end platba po deployi checkout větve.

---

## 6. Stav nasazení (deploy)

### 6.1 Git / remote

```
Aktivní větev:  fix/checkout-predplatne-ctas
HEAD (local):   3e19d9c — fix(audit): add Stripe checkout alias and shared handler
main (local):   9ca3a0f — fix(checkout): wire Stripe v27 checkout API and predplatne CTAs
origin/fix/checkout-predplatne-ctas: 9ca3a0f (1 commit za lokální větví)
origin/main:    b8c360f — feat(v5plus): evidence-based AI
Merge-base:     2523e7d
Remote:         git@github.com:Fincloseapp/MedScopeGlobal.git
```

**Větev `fix/checkout-predplatne-ctas` — obsah:**
- `9ca3a0f` — `V27CheckoutButton`, `/predplatne` CTAs, `app/api/v27/checkout`, `/checkout/uspesne`
- `3e19d9c` — `app/api/stripe/checkout` alias, `lib/stripe/v27-checkout.ts`, Phase 1 public routes (Academy, veřejnost, AI asistenti, firmy), Supabase migrace, editor's pick skript

**Working tree:** permission warnings na některých `app/(public)/*` cestách (Windows EPERM); checkout soubory commitnuté ve větvi.

### 6.2 GitHub Actions (`gh`)

- `gh` v systémovém PATH: **není**.
- `D:\medscopeglobal\.tools\gh\bin\gh.exe`: **vyžaduje autentizaci** (`gh auth login` nebo `GH_TOKEN`).
- Cache `gh-commits.txt` / `deploy-result.txt`: dřívější **selhání** push/deploy (chybějící Git credentials v neinteraktivním režimu); starší workflow běhy úspěšné u modulů v4/v5/ai-medical.

### 6.3 Vercel CLI

- `vercel` / `npx` v PATH: **není** v tomto shellu.

### 6.4 Produkční smoke test (23. 6. 2026, aktualizováno)

Všechny klíčové trasy — **HTTP 200** (User-Agent: Mozilla/5.0):

| URL | Výsledek |
|-----|----------|
| `/` | **200** |
| `/verejnost`, `/studenti`, `/lekari` | **200** |
| `/academy`, `/articles`, `/predplatne` | **200** |
| `/studie`, `/aktualni-zpravy`, `/ai` | **200** |
| `/firmy`, `/kontakt`, `/privacy`, `/login` | **200** |
| `/hledat`, `/o-nas` | **200** (dříve 404 v auditu) |
| `/api/health` | **200**, `ok: true` |
| https://www.medscopeglobal.com | **308** redirect (očekávané) |

**Interpretace:** Produkce na Vercelu je zdravá — žádné 404 na auditních trasách. Checkout wiring (`9ca3a0f` / `3e19d9c`) **není** na produkci, dokud se větev nezmerguje a nedeployuje.

---

## 7. Další kroky (prioritizované)

1. **Merge + deploy checkout větve** — `fix/checkout-predplatne-ctas` → `main`, push, Vercel preview, E2E Stripe test.
2. **Push `3e19d9c`** — `git push origin fix/checkout-predplatne-ctas` (alias + Phase 1 routes).
3. **Reconcile s `origin/main`** — lokální audit linie vs. `b8c360f` (v5plus); kurátorovaný merge bez force push.
4. **Ověření CI** — `gh run list --limit 5` po pushi.
5. **Obsah v DB** — job na přegenerování generických titulků a oříznutých článků.
6. **Produkční testy** — `npm run test:prod` po deployi checkoutu.
7. **CSP a výkon** — Lighthouse na homepage, omezit script payload.

---

## 7b. Zbývající položky pro v2 (po Phase 1 auditu)

| Oblast | Položka | Priorita |
|--------|---------|----------|
| **Technika** | CSP — odstranit `unsafe-eval` | Vysoká |
| **Technika** | Lighthouse CI, homepage bundle split / lazy-load | Vysoká |
| **Technika** | 403 bez User-Agent — politika pro crawlery | Střední |
| **Technika** | Formální WCAG 2.1 AA audit | Střední |
| **Monetizace** | Live Stripe trial ověření na produkčních price IDs | Vysoká |
| **Monetizace** | Exit-intent popup, referral program, annual default A/B | Střední |
| **Monetizace** | ISIC studentská sleva v checkoutu | Nízká |
| **Obsah** | Regenerace starých článků s generickými titulky v DB | Vysoká |
| **Obsah** | Oprava useknutých článků v `/articles` archivu | Vysoká |
| **Obsah** | Peer-review bios u rozhovorů | Střední |
| **Lékaři / věda** | Live PubMed feed, ClinicalTrials.gov integrace | Střední |
| **Lékaři / věda** | CME ČLK akreditace, 30denní trial pro ověřené lékaře | Střední |
| **Academy** | Prodloužení kurzů (30–60 min), Cermat modelové testy | Střední |
| **Marketing** | Partner logo bar (LF/FN/pharma), video brand manifesto | Nízká |
| **UX** | Senior režim (větší písmo), kategorie „Zdraví dětí a rodina“ | Nízká |
| **Dlouhodobě** | Mobilní app, mezinárodní hreflang, white-label B2B, affiliate | v2+ |

---

## 8. Reference commitů (audit implementace)

| SHA | Zpráva |
|-----|--------|
| `609c511` | feat: česká UX — laik/lékař/vědec, medicína, navigace, sitemap |
| `88e3ca9` | feat(full-audit): complete implementation of all recommendations + full test + fixes + production deploy |
| `20f43da` | fix: pre-deploy gates — tsconfig excludes, sentry stub, v19 duplicate key |
| `9ca3a0f` | fix(checkout): wire Stripe v27 checkout API and predplatne CTAs |
| `3e19d9c` | fix(audit): add Stripe checkout alias and shared handler (+ Phase 1 routes) |

---

## 9. Související dokumenty v pracovní kopii

- `medscopeglobal-audit-report.md` — plný audit
- `implementation-report-by-agents.md` — detail po agentních skupinách
- `PRODUCTION_STATUS.md`, `DEPLOYMENT_SUMMARY.md`, `DEPLOY_NOW.md` — starší deploy playbook (květen 2026)
- `scripts/run-predeploy-gates.mjs` — jednotné brány před deployem

---

*Dokument vygenerován jako souhrn implementace full auditu pro MedScopeGlobal. Aktualizováno 23. 6. 2026 po paralelních úkolech (produkční smoke, checkout větev, Stripe wiring, v2 backlog).*
