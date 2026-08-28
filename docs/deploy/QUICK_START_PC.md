# Rychlý deploy z PC (D:)

## Nejrychlejší cesta na živý web / Fastest path to live

```powershell
cd D:\medscope.local
git pull origin main
pnpm deploy:production
```

Obnoví secrets z D:, ověří DB (`db:verify`), nasadí na Cloudflare Workers a spustí `smoke:production` + `smoke:ecosystem:production`.

**Doporučený flow s zálohou** (backup → verify → deploy → smoke):

```powershell
cd D:\medscope.local
git pull origin main
pnpm sync:d
pnpm db:verify
pnpm deploy:production -- -SkipRestore
```

Záloha skončí v `D:\medscope.data\backups\<yyyy-MM-dd>\`.

---

## Bez Cloudflare tokenu na PC

Použijte **Cloudflare Workers Builds** v dashboardu — viz [`CF_DASHBOARD_DEPLOY.md`](./CF_DASHBOARD_DEPLOY.md).

Push na `main` → automatický build (`npm run cf:build` + `npx opennextjs-cloudflare deploy`).

---

## Ruční kroky / Manual steps

1. `cd D:\medscope.local` → `git pull origin main`
2. `pnpm sync:d` — obnoví `.env.local` + záloha na `D:\medscope.data\backups\YYYY-MM-DD\`
3. `pnpm db:verify` — ověření Supabase schématu (MediFlow, editorial queue)
4. Pokud migrace chybí: `pnpm db:trigger-ecosystem-cron` **nebo** SQL Editor **nebo** `pnpm db:apply-ecosystem`
5. `pnpm cf:deploy` — build + deploy na Cloudflare Workers (`medscopeglobal.com`)
6. Ověř: `pnpm smoke:production` a `pnpm smoke:ecosystem:production`
7. Volitelně (editorial obrázky): `pnpm images:backfill` — doplní návrhy obrázků pro články bez coveru

---

## Windows operator command block

```powershell
cd D:\medscope.local
git fetch origin
git checkout main
git pull origin main

pnpm sync:d
pnpm db:verify
# pokud FAIL:
pnpm db:trigger-ecosystem-cron
pnpm db:verify

pnpm deploy:production -- -SkipRestore
pnpm images:backfill   # volitelné

curl.exe -sL https://medscopeglobal.com/cs | Select-String -Pattern 'VitaScope|MediFlow'
```

---

## Související dokumentace

- Plný D: restore / backup: [`RESTORE_FROM_D.md`](./RESTORE_FROM_D.md)
- Article expand + image backfill (PC): [`PC_ARTICLE_EXPAND_BACKFILL.md`](./PC_ARTICLE_EXPAND_BACKFILL.md)
- Stripe donations Worker secrets + webhook: [`STRIPE_DONATIONS.md`](./STRIPE_DONATIONS.md)
- Operátorský checklist: [`MANUAL_OPERATOR_CHECKLIST.md`](./MANUAL_OPERATOR_CHECKLIST.md)
- Po merge ecosystem PR: [`POST_MERGE_CHECKLIST.md`](./POST_MERGE_CHECKLIST.md)
- Produkční smoke: `pnpm smoke:production` + `pnpm smoke:ecosystem:production` (očekává VitaScope na `/cs`)
