# Rychlý deploy z PC (D:)

## Nejrychlejší cesta na živý web / Fastest path to live

```powershell
cd D:\medscope.local
git pull origin main
pnpm deploy:production
```

Obnoví secrets z D:, nasadí na Cloudflare Workers a spustí `smoke:production`.

---

## Bez Cloudflare tokenu na PC

Použijte **Cloudflare Workers Builds** v dashboardu — viz [`CF_DASHBOARD_DEPLOY.md`](./CF_DASHBOARD_DEPLOY.md).

Push na `main` → automatický build (`npm run cf:build` + `npx opennextjs-cloudflare deploy`).

---

## Ruční kroky / Manual steps

1. `cd D:\medscope.local` → `git pull origin main`
2. `pnpm sync:d` — obnoví `.env.local` + záloha na `D:\medscope.data\backups\`
3. `pnpm cf:deploy` — build + deploy na Cloudflare Workers (`medscopeglobal.com`)
4. Ověř: `pnpm smoke:production` nebo `curl -sL https://medscopeglobal.com/cs | findstr VitaScope`
5. Volitelně: `MEDSCOPE_ORIGIN=https://medscopeglobal.com pnpm smoke:ecosystem`

---

## Po merge PR #19

- Ruční kroky (migrace, sync, secrets): [`MANUAL_OPERATOR_CHECKLIST.md`](./MANUAL_OPERATOR_CHECKLIST.md)
- Migrace Supabase: [`POST_MERGE_CHECKLIST.md`](./POST_MERGE_CHECKLIST.md) §2
- Produkční smoke: `pnpm smoke:production` (očekává VitaScope na `/cs`)
