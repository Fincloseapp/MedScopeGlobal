-- Table-level SELECT still exposed `content` to anon after a column REVOKE.
-- Drop body privileges from public/anon/authenticated; keep titles/cards.

revoke all (content) on table public.articles from public, anon, authenticated;
grant select (content) on table public.articles to service_role;
grant select (content) on table public.articles to postgres;
