# MedScopeGlobal – Medicínský obsahový portál

Produkční platforma pro odborné medicínské články s RBAC, generováním obsahu, validací zdrojů a fulltextovým vyhledáváním.

## Architektura

### Backend
- **Next.js 16 App Router** – server-side rendering + Route Handlers (`/api/portal/*`)
- **In-memory store** – výchozí persistence pro dev/test (seed demo dat)
- **Prisma + PostgreSQL** – produkční schema (`PortalUser`, `PortalArticle`, `ArticleRating`, `SavedArticle`)
- **Auth** – HMAC-signed session cookies, scrypt password hashing
- **RBAC** – role `reader`, `expert`, `admin` s ověřením domény e-mailu

### Frontend
- React 19 + TypeScript
- Portálové stránky: `/portal`, `/portal/articles`, `/portal/manage`
- Auth: `/auth/login`, `/auth/register`
- Medical-grade UI s důrazem na čitelnost

## Datový model

| Entita | Klíčová pole |
|--------|-------------|
| **PortalUser** | email, passwordHash, role, verificationStatus, institution |
| **PortalArticle** | title, sections[], clinicalSignificance, practiceRecommendations, citations[], tags[], icdCodes[], status |
| **Citation** | title, sourceName, sourceUrl, doi, year |
| **ArticleRating** | userId, articleId, score (1–5) |
| **SavedArticle** | userId, articleId |

## Role a oprávnění

| Role | Oprávnění |
|------|-----------|
| **Reader** | čtení, ukládání, hodnocení |
| **Expert** | + vytváření, editace, publikace, validace (po schválení) |
| **Admin** | + schvalování expertů, správa všech článků |

Ověření experta: automatické pro domény LF UK, LF MU, FN atd.; jinak manuální schválení adminem.

## API

| Endpoint | Metoda | Popis |
|----------|--------|-------|
| `/api/portal/auth/register` | POST | Registrace |
| `/api/portal/auth/login` | POST | Přihlášení |
| `/api/portal/auth/logout` | POST | Odhlášení |
| `/api/portal/auth/me` | GET | Aktuální uživatel |
| `/api/portal/articles` | GET/POST | Seznam / vytvoření |
| `/api/portal/articles/generate` | POST | AI generování |
| `/api/portal/articles/[id]` | GET/PUT/DELETE | Detail / editace / smazání |
| `/api/portal/articles/[id]/publish` | POST | Publikace draft→published |
| `/api/portal/articles/[id]/rate` | POST | Hodnocení |
| `/api/portal/articles/[id]/save` | POST/DELETE | Uložení |
| `/api/portal/sources` | GET | Katalog zdrojů |

## Demo účty

- Čtenář: `reader@example.com` / `Reader123!`
- Odborník: `expert@lf1.cuni.cz` / `Expert123!`
- Admin: `admin@medscopeglobal.com` / `Admin123!`

## Spuštění

```bash
npm install
npm run dev
npm run test
npm run ci
```

## Zdroje

České: ČLS JEP, LF UK (1–3), LF MU, LF UPOL, SÚKL, ÚZIS, české časopisy  
Zahraniční: PubMed, WHO, ESC, EULAR, NEJM, Lancet, BMJ
