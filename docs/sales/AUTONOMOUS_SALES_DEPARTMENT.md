# Autonomní obchodní oddělení MedScopeGlobal

Prodejní automatizace paušální inzerce běží v administraci
[`/admin/sales`](https://medscopeglobal.com/admin/sales). Cíl: co nejvíc firem platí
měsíční paušál, dostane fakturu a má splněné to, co si koupila (plochy + předání poptávek).

Veřejné vstupy:

| Cesta | Účel |
|-------|------|
| `/inzerce/pausal` | Ceník paušálů a objednávka |
| `/inzerce/podminky` | Smluvní + reklamní + GDPR podmínky inzerce |
| `/partneri` | Adresář aktivních platících inzerentů |
| `/partneri/[slug]` | Landing + formulář poptávky (označená inzerce) |
| `/inzerenti/portal?token=` | Portál inzerenta: stav, faktury, poptávky |

Jednorázové kampaně zůstávají na `/inzerce/formular` (stávající `ads_requests`).
Tržiště pro inzerenty a kupující: [`/exchange`](https://medscopeglobal.com/exchange)
(nabídky + poptávky + formulář). Návod: [`/exchange/navod`](https://medscopeglobal.com/exchange/navod).
Příjem e-mailem: `inzerce@medscopeglobal.com` → `/api/marketplace/inbound-email`.

## Tok A–Z

1. **Vyhledání** — cron `/api/cron/sales-department` nasadí ICP katalog (firmy a weby, bez vymyšlených e-mailů).
2. **Inbound** — `ads_requests`, `b2b_inquiries` a formulář paušálu = právní základ *inquiry*.
3. **Kvalifikace** — sektor (Rx jen odborná plocha), skóre, redakční board kreativ.
4. **Oslovení** — nabídkový e-mail s odhlášením. Studený B2B e-mail **čeká na schválení** v dashboardu, pokud není `SALES_AUTO_OUTBOUND=true`. Inbound se posílá sám.
5. **Nabídka / uzavření** — smlouva vzniká úhradou. Stripe subscription nebo převod s VS.
6. **Faktura** — HTML + PDF, číslo `MSG-SAL-YYYYMM-NNNN`, neplátce DPH dle ARES.
7. **Plnění** — aktivace řádků v `ads` podle tarifu, profil `/partneri/{slug}`.
8. **Poptávky** — `/api/sales/inquiry` předá e-mail inzerentovi jen při aktivním paušálu, jinak drží.
9. **Obnova / dunning** — 7 dní před koncem nová faktura (převod); Stripe strhává sám. Po splatnosti + 3 dny paušál pozastaví plochy.
10. **Audit** — `sales_runs`, `sales_events`, e-mailové logy, Stripe webhook `kind=sales_retainer`.

## Tarify (Kč, bez DPH — provozovatel je neplátce)

Měsíční platba, nebo roční předplatné = 10 měsíců (2 měsíce zdarma).

| ID | Název | / měsíc | / rok | efektivně / měs. | Plnění |
|----|-------|---------|-------|------------------|--------|
| start | Start | 450 | 4 500 | 375 | adresář, landing, poptávky SLA 72 h |
| visible | Viditelnost | 890 | 8 900 | 742 | + sidebar článků, SLA 48 h |
| magazine | Magazín | 1 790 | 17 900 | 1 492 | + homepage mid, newsletter patička, report, SLA 24 h |
| clinical | Klinický | 3 490 | 34 900 | 2 908 | + homepage top, inline, newsletter střed, zmínka, SLA 12 h |
| partner | Partner | 5 990 | 59 900 | 4 992 | + newsletter hlavička, digitální zdraví, SLA 8 h |

## Právní brány (nesmí se vypnout v kódu)

- Zákon č. 40/1995 Sb. o regulaci reklamy — označení inzerce.
- Zákon č. 378/2007 Sb. + SÚKL — Rx ne na veřejný magazín.
- GDPR čl. 6 — inquiry / consent / customer, nebo LIA jen na role e-mail (`info@`, `marketing@`, …).
- Zákon č. 480/2004 Sb. — identifikace odesílatele + odhlášení v každém nabídkovém mailu.
- Osobní mailboxy (Seznam, Gmail, …) u LIA se **neposílají**.
- Hádané e-maily (`unverified_guess`) se nikdy neodesílají.
- Max. 3 kontakty, min. 7 dní mezi nimi, cap na běh (`SALES_MAX_EMAILS_PER_RUN`, default 12).

## Administrativa po merge

1. Aplikovat SQL `supabase/migrations/20260913220000_sales_department.sql`  
   (SQL Editor, `pnpm db:migrate`, nebo cron `/api/cron/apply-ecosystem-migrations` — schema se volá i z ticku).
2. Ověřit `pnpm db:verify` → tabulky `sales_*`.
3. Stripe webhook už existuje: `/api/stripe/webhook` umí `kind=sales_retainer` a obnovovací `invoice.paid`.
4. Cron GitHub: `.github/workflows/cloudflare-cron.yml` volá `/api/cron/sales-department`.
5. Volitelně Worker secret `SALES_AUTO_OUTBOUND=true` jen pokud chcete samovolné B2B LIA maily na role adresy.
6. IBAN / účet pro VS převody: `LEGAL_ENTITY_IBAN`, `LEGAL_ENTITY_BANK_ACCOUNT`.

## Env

```
SALES_AUTO_OUTBOUND=false
SALES_MAX_TOUCHES=3
SALES_MAX_EMAILS_PER_RUN=12
```

## Kód

| Modul | Role |
|-------|------|
| `lib/sales/runner.ts` | autonomní tick |
| `lib/sales/legal.ts` | GDPR / 480 / LIA brána |
| `lib/sales/billing.ts` | faktura + Stripe |
| `lib/sales/fulfillment.ts` | plochy + poptávky |
| `lib/sales/packages.ts` | ceník |
| `app/(admin)/admin/sales/page.tsx` | dashboard |

Dashboard záložky: přehled, **tržiště** (příjem nabídek/poptávek + stav odesílání e-mailu),
pipeline, inzerenti, fronta e-mailů ke schválení, faktury, poptávky, právní stav.

Pět kontrolorů (`lib/sales/control.ts`) běží na konci každého ticku a v snapshotu dashboardu:
příjem, právní, diplomatický, plnění, výnos. Ověřený popis prostředí a postupu:
[`OVERENE_TRZISTE.md`](./OVERENE_TRZISTE.md).

E-mail inzerce jde přes `sendEmail` (Cloudflare Email Sending → SendGrid → SMTP), ne jen Resend.
Bez transportního klíče se zpráva zaloguje a cron ji zkusí znovu. Autoodpovědi pokrývají cenu,
zveřejnění, poptávky, podmínky, fakturu a termíny.
