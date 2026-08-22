# Automatický deploy MedScopeGlobal → medscopeglobal.com

Cíl: **git push na `main` → live na medscopeglobal.com** bez ručního `npm run deploy` / `npm run ship` z PC.

Dva podporované kanály (oba používají Linux CI, ne D: FAT32):

| Kanál | Kdy použít | Co nastavit jednou |
|-------|------------|-------------------|
| **A) Cloudflare Workers Builds** (doporučeno) | Push na GitHub spustí build přímo v Cloudflare | Dashboard: připojit repo |
| **B) GitHub Actions** | Záloha / plná kontrola v repu | GitHub Secrets: API token |

Worker: `medscopeglobal` · Account ID: `d3108976a0c396327ce8eb87d9f71c0c` · Repo: `Fincloseapp/MedScopeGlobal`

---

## A) Cloudflare Workers Builds (preferovaná cesta)

Workers Builds zatím **není připojené** (0 builds). Jednorázové nastavení v dashboardu:

1. Otevřete [Workers & Pages](https://dash.cloudflare.com/?to=/:account/workers-and-pages) → worker **medscopeglobal**.
2. **Settings** → **Builds** → **Connect**.
3. Vyberte **GitHub** a autorizujte Cloudflare GitHub App pro org **Fincloseapp** (pokud ještě není).
4. Vyberte repo **Fincloseapp/MedScopeGlobal**.
5. Nastavte:

   | Pole | Hodnota |
   |------|---------|
   | Production branch | `main` |
   | Root directory | `/` |
   | Build command | `npm run cf:build` |
   | Deploy command | `npx opennextjs-cloudflare deploy` |

6. **Save and Deploy** (nebo uložit a pushnout na `main`).

Cloudflare automaticky injektuje `WORKERS_CI=1` a API token pro deploy — **nejsou potřeba GitHub Secrets**.

### Volitelné build proměnné (Settings → Builds → Variables)

Pokud SSR potřebuje Supabase klíče při buildu (`.dev.vars`), přidejte v dashboardu nebo nechte runtime secrets na Workeru (doporučeno pro produkci):

- `NEXTJS_ENV=production`
- `NEXT_PUBLIC_SITE_URL=https://medscopeglobal.com`
- `MEDSCOPE_RUNTIME=cloudflare-workers`

Supabase URL/klíče jsou už nastavené jako **Worker secrets** v dashboardu — build je může vynechat.

### Ověření

Po prvním buildu: Workers → medscopeglobal → **Deployments** → build log. Pak `https://medscopeglobal.com/api/health`.

---

## B) GitHub Actions (záložní CI)

Workflow: `.github/workflows/cloudflare-deploy.yml` — spouští se na **push do `main`** a `workflow_dispatch`.

### Jednorázové GitHub Secrets

Repo **Fincloseapp/MedScopeGlobal** → **Settings** → **Secrets and variables** → **Actions**:

| Secret | Hodnota |
|--------|---------|
| `CLOUDFLARE_API_TOKEN` | User-scoped token: **Workers Scripts Edit** (+ doporučeno Workers Builds Configuration Edit) |
| `CLOUDFLARE_ACCOUNT_ID` | `d3108976a0c396327ce8eb87d9f71c0c` |
| `CLOUDFLARE_ENV_JSON` | *(volitelné)* JSON objekt pro `.dev.vars` při buildu |

Token vytvořte na [dash.cloudflare.com/profile/api-tokens](https://dash.cloudflare.com/profile/api-tokens).

Workflow bez secretů **selže hned** s návodem v logu (fail-fast).

### Lokální PC vs CI

| Prostředí | Příkaz | Auth |
|-----------|--------|------|
| Windows D: (ruční) | `npm run deploy` | wrangler OAuth |
| GitHub Actions / Workers Builds | `pnpm cf:deploy` / OpenNext deploy | API token / `WORKERS_CI` |

---

## Tok po nastavení

```
git push origin main
       │
       ├─► Workers Builds (pokud připojeno) → build + deploy → medscopeglobal.com
       │
       └─► GitHub Actions (pokud secrets)   → pnpm cf:deploy → smoke test
```

Branch `feat/longer-public-articles` (nebo jiné) **nespustí produkci**, dokud není mergnutá do `main` nebo není production branch v Workers Builds změněna.

---

## API (pokročilé)

Po instalaci Cloudflare GitHub App lze Workers Builds dokončit přes [Builds API](https://developers.cloudflare.com/workers/ci-cd/builds/api-reference/) (`POST /builds/workers`). Vyžaduje user-scoped token a GitHub repo ID `1249656741` (Fincloseapp/MedScopeGlobal).
