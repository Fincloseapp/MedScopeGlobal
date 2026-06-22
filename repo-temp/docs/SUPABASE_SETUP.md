# MedScopeGlobal — Supabase a .env.local (hotovo / dokončení)

## Co je už nastaveno

| Položka | Stav |
|---------|------|
| Projekt Supabase | `xcydgqnivxfhprbmdyym` |
| `.env.local` | URL, anon key, service role, `CRON_SECRET`, `SUPABASE_PROJECT_REF` |
| Připojení API | Ověřeno (`npm run db:verify` ✅) |
| Aplikace vs. DB | Kompatibilní přes mapování `summary` → `excerpt` |

## Dokončení schématu (jednou, ~2 min)

Pro plné sloupce (`excerpt`, `vip_only`, ingest ze světa) spusťte migrace:

### Varianta A — CLI (doporučeno)

```bash
npx supabase login
npm run db:migrate
npm run db:verify
```

### Varianta B — SQL Editor

1. Otevřete: https://supabase.com/dashboard/project/xcydgqnivxfhprbmdyym/sql/new  
2. Vložte obsah souboru `supabase/APPLY_IN_DASHBOARD.sql`  
3. Spusťte **Run**

### Volitelně: OpenAI pro plnou AI ingest

V `.env.local` doplňte:

```
OPENAI_API_KEY=sk-...
```

## Spuštění

```bash
npm run dev
```

Admin: po registraci nastavte roli v SQL:

```sql
update public.users set role = 'admin' where id = 'VÁŠ_UUID';
```

Automatické články: `/admin/ingestion` → **Start ingestion**
