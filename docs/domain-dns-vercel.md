# medscopeglobal.com — DNS pro Vercel

**DNS provider:** Cloudflare (`amos.ns.cloudflare.com`, `dana.ns.cloudflare.com`)

## Požadované záznamy

| Typ | Název | Hodnota | TTL |
|-----|-------|---------|-----|
| A | `@` | `76.76.21.21` | 3600 (auto v CF) |
| CNAME | `www` | `cname.vercel-dns.com` | 3600 (auto v CF) |

Při novém přidání domény může Vercel vyžadovat TXT ověření `_vercel` — hodnotu získáte v Project → Domains.

## Automatizace

```bash
npm run domain:connect   # Vercel API + ověření + testy
npm run dns:cloudflare # Cloudflare DNS (vyžaduje CLOUDFLARE_API_TOKEN)
```
