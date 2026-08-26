# Cloudflare Workers Builds — deploy bez GitHub secrets

**Deploy without GitHub secrets** — use the Cloudflare dashboard when `CLOUDFLARE_API_TOKEN` is not in GitHub Actions.

---

## 5 kroků / 5 steps

### 1. Otevřete projekt / Open project

[Cloudflare Dashboard → Workers & Pages → **medscopeglobal**](https://dash.cloudflare.com/?to=/:account/workers-and-pages)

### 2. Propojte GitHub / Connect GitHub

**Settings → Builds → Connect** → repo `medscopeglobal` (nebo váš fork) → production branch **`main`**.

### 3. Build & deploy příkazy / Commands

| Pole / Field | Hodnota / Value |
|--------------|-----------------|
| Root directory | `/` |
| Build command | `npm run cf:build` |
| Deploy command | `npx opennextjs-cloudflare deploy` |

*(Alternativa: Build prázdné, Deploy = `npm run deploy`.)*

### 4. Proměnné prostředí / Environment variables

**Settings → Variables and Secrets** — zkopírujte z `D:\medscope.local\.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SITE_URL` = `https://medscopeglobal.com`
- `CRON_SECRET`, Stripe klíče (pokud platby aktivní)

Nebo na PC: `pnpm cf:env:sync` → vložte obsah `scripts/cloudflare/.env.cloudflare.json` do dashboardu.

### 5. Deploy + ověření / Deploy + verify

Push na `main` spustí build automaticky. Ručně: **Deployments → Retry deployment**.

```bash
pnpm smoke:production
curl -sL https://medscopeglobal.com/cs | grep -i VitaScope
```

Očekáváno: `/cs` **200** + text **VitaScope**.

---

**Rychlejší z PC (s tokenem):** `pnpm deploy:production` — viz [`QUICK_START_PC.md`](./QUICK_START_PC.md).
