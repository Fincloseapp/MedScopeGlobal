# Rychlý deploy z PC (D:)

1. `cd D:\medscope.local` → `git pull origin cursor/global-health-ecosystem-2b2d`
2. `pnpm sync:d` — obnoví `.env.local` + záloha na `D:\medscope.data\backups\`
3. `pnpm cf:deploy` — build + deploy na Cloudflare Workers (`medscopeglobal.com`)
4. Ověř: `curl -s https://medscopeglobal.com/cs | findstr VitaScope` (nebo prohlížeč)
5. Volitelně: `MEDSCOPE_ORIGIN=https://medscopeglobal.com pnpm smoke:ecosystem`
