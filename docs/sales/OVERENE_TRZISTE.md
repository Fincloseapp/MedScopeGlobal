# Ověřený postup: tržiště jako samostatná výnosová část MedScopeGlobal

Tento dokument popisuje **ověřenou funkčnost** (stav kódu + lokální kontroly).
Cíl: tržiště vydělává a zpracovává inzerci **u sebe**, ne v magazínu ViaLongeVita.
Obchod s inzerenty a zákazníky běží autonomně, právně a diplomaticky, bez prodlevy.

Související technický tok paušálů: [`AUTONOMOUS_SALES_DEPARTMENT.md`](./AUTONOMOUS_SALES_DEPARTMENT.md).

## 1. Čtyři části prostředí (hned na úvodní stránce)

Po otevření `/` (česky `/cs`) je **první blok** mapa prostředí
(`HomepagePillars`, `data-studio="environment-map"`), **před** hero magazínu.

| Část | Veřejná cesta | Co tam patří | Co tam nepatří |
|------|---------------|--------------|----------------|
| Magazín ViaLongeVita | `/articles` | Články, předplatné, čtenářské bannery | B2B paušál, poptávky nemocnic |
| **Tržiště (samostatná jednotka)** | `/exchange` | Nabídky, poptávky, paušál, příjem inzerce | Bannery uvnitř článku |
| Studenti | `/studenti`, `/app/priprava` | MeDiprep | Inzerce firem |
| Lékaři | `/lekari`, `/app/dokumentace` | OrdiZapis | Tržiště |

Karta tržiště na homepage: eyebrow *Samostatná část · B2B výnos*, CTA **Otevřít tržiště** → `/exchange`,
sekundární **Návod a paušál** → `/exchange/navod`.

Spodní B2B blok homepage (`V271B2bBlock`) má dva sloupce: tmavé **tržiště** vs. světlý **magazín · jiná část** (`/firmy`).

## 2. Co tržiště vydělává

Výnos je **měsíční paušál inzerenta** (Start 4 900 Kč → Partner 69 900 Kč), ne provize z obchodu
a ne jednorázový banner v článku.

Platící inzerent dostane:

- viditelnost nabídek na `/exchange` a v adresáři `/partneri`;
- předání poptávek institucí na svůj e-mail (SLA podle tarifu);
- landing `/partneri/[slug]`.

Jednorázové čtenářské bannery zůstávají na `/firmy` a `/inzerce/formular` — **jiný produkt**.

## 3. Veřejný tok inzerenta a zákazníka

```
Formulář /exchange#formular     ─┐
E-mail inzerce@medscopeglobal.com─┼─► marketplace_listings + marketplace_messages
Inbound webhook                   ─┘
        │
        ├─ právní / diplomatický board (Rx, zákon o reklamě, tón)
        │     deny → status rejected, ne na desku
        ├─ auto-odpověď (cena, zveřejnění, poptávka, podmínky, faktura, termín)
        ├─ notifikace admina
        └─ sales tick (cron) → prospect → nabídka paušálu → faktura → plnění
```

| Vstup | Endpoint / UI |
|-------|----------------|
| Nabídka / poptávka / otázka | `POST /api/marketplace/listing` (formulář na `/exchange`) |
| Otázka | `POST /api/marketplace/question` |
| E-mail (JSON, form, RFC822) | `POST /api/marketplace/inbound-email` (secret: `MARKETPLACE_INBOUND_SECRET` / SendGrid / `CRON_SECRET`) |
| Paušál | `/inzerce/pausal` → `POST /api/sales/order` |
| Poptávka na inzerenta | `/api/sales/inquiry` — předá se jen při **aktivním** paušálu |
| Návod | `/exchange/navod` (45 s přehled, timed slides) |

Kontakty z poptávek **nejsou veřejné**. Vidí je až platící paušál.

## 4. Autonomní obchodní oddělení (bez prodlevy)

Cron GitHub (`.github/workflows/cloudflare-cron.yml`) volá `/api/cron/sales-department`.
Stejný tick jde spustit z `/admin/sales` tlačítkem **Spustit autonomní běh**.

Každý tick:

1. doplní schema `sales_*` a `marketplace_*`;
2. odpoví na záznamy tržiště bez `auto_replied_at`;
3. stáhne inbound z `ads_requests` / `b2b_inquiries` (právní základ *inquiry*);
4. zařadí nabídkový e-mail; **studený B2B** čeká na schválení, pokud není `SALES_AUTO_OUTBOUND=true`;
5. vystaví / pošle fakturu, aktivuje plochy, předá poptávky v SLA, dunning + pauza po splatnosti;
6. redakční board **odmítne** viditelné inzeráty s `deny`;
7. zapíše `sales_control` — pět kontrolorů.

## 5. Pět kontrolorů (kontrolní mechanismus tržiště)

Funkce `evaluateSalesControl()` (`lib/sales/control.ts`). Dashboard `/admin/sales` je ukáže hned nahoře.

| Kontrolor | `ok` | `warn` | `block` |
|-----------|------|--------|---------|
| Koordinátor příjmu | transport e-mailu běží, nic nečeká | záznamy bez auto-odpovědi | chybí Cloudflare / SendGrid / SMTP |
| Kontrolor právní | brány drží | studený B2B ve frontě / přeskočeno | — (brány se nevypínají; deny jde do rejected) |
| Kontrolor diplomatický | tón v pořádku | fronta ke kontrole tónu (`needs_approval`) | — |
| Kontrolor plnění | poptávky v SLA | přijaté čekají na předání | SLA po lhůtě |
| Kontrolor výnosu | paušály v pořádku | čeká se na platbu | faktury po splatnosti |

Nejhorší stav (`salesControlWorst`) = `block` > `warn` > `ok`. Cíl: **žádná tichá fronta**.

## 6. Právní a diplomatické brány (nelze vypnout v kódu)

- Zákon č. 40/1995 Sb. — inzerce musí být označená.
- Zákon č. 378/2007 Sb. + SÚKL — Rx jen na odbornou plochu, ne do veřejného magazínu.
- GDPR čl. 6 — inquiry / consent / customer; LIA jen na role e-mail.
- Zákon č. 480/2004 Sb. — identifikace + odhlášení v nabídkovém mailu.
- Osobní mailboxy (Seznam, Gmail) u LIA se neposílají.
- Hádané e-maily (`unverified_guess`) se nikdy neodesílají.
- Max. 3 kontakty, min. 7 dní, cap na běh (`SALES_MAX_EMAILS_PER_RUN`, default 12).

Diplomatický editor odmítá agresivní / urážlivý tón. Magazín do tohoto toku **nevstupuje**.

## 7. Admin — kde to řídíte

1. Přihlášení `/admin/login` (brána).
2. `/admin` — banner **Obchodní oddělení a tržiště**.
3. Sidebar Peníze → první položka **Obchodní oddělení** → `/admin/sales`.
4. Karty kontrolorů nahoře na `/admin/sales`. Záložka **Tržiště** ukáže stav schránky a tabulku příjmu
   (prázdný stav, pokud ještě není service role / SQL).
5. Odkazy na veřejné `/exchange` a `/inzerce/pausal`.

Bez `SUPABASE_SERVICE_ROLE_KEY` dashboard ukáže ceník, právní pravidla a stav mailu, pipeline je prázdná.

## 8. Po merge do produkce (ověřený provozní checklist)

1. SQL v tomto pořadí (SQL Editor nebo `pnpm db:migrate` s `MEDSCOPE_PROJECT_ROOT=/workspace`):
   - `supabase/migrations/20260913220000_sales_department.sql`
   - `supabase/migrations/20260914070000_marketplace_desk.sql`
2. `pnpm db:verify` → tabulky `sales_*`, `marketplace_listings`, `marketplace_messages`.
3. Worker / `.env`: e-mailový transport (Cloudflare Email Sending, SendGrid nebo SMTP).
   Bez něj kontroloři hlásí **blok** na příjmu — formulář se uloží, mail se jen zaloguje a tick to zkusí znovu.
4. Směrování schránky `inzerce@medscopeglobal.com` → `POST /api/marketplace/inbound-email`
   s `Authorization: Bearer …` nebo `?secret=` (`MARKETPLACE_INBOUND_SECRET`, jinak SendGrid / `CRON_SECRET`).
   **Bez klíče endpoint vrací 401** — nenechávejte ho otevřený.
5. Cron už volá `/api/cron/sales-department`. Schema se z ticku aplikuje jen pokud existuje
   `SUPABASE_ACCESS_TOKEN`; v produkci SQL vždy nahrajte ručně, apply-schema je záloha.
6. Stripe webhook umí `kind=sales_retainer`.
7. Volitelně `SALES_AUTO_OUTBOUND=true` jen pokud chcete samovolné LIA maily na role adresy.
8. Formulář tržiště zapne Turnstile, jakmile je `TURNSTILE_SECRET_KEY` (+ public site key).

Tabulky `marketplace_*` mají RLS bez anon policy — čte/píše je jen service role. Veřejná deska
skládá živé paušály + schválené listingy přes server.

## 9. Lokálně ověřené (tento branch)

- `pnpm typecheck`
- `pnpm exec tsx scripts/apps/functional-check.ts`
  - mapa prostředí je **před** hero magazínu;
  - CZ kicker tržiště obsahuje „ne magazín“;
  - `evaluateSalesControl` bez transportu → intake `block`;
  - cron YAML obsahuje sales tick.
- Prohlížeč: `/` (čtyři karty hned nahoře), `/exchange` (nabídky + poptávky + oddělení od magazínu),
  `/admin/sales` (pět kontrolorů).

E-mail na ostrém účtu se v cloud VM **neodesílá**, dokud není reálný transport — to je záměr, ne chyba UI.
