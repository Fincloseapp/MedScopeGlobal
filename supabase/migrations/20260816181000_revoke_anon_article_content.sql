-- Keep published rows visible for cards/titles. Hide full bodies from
-- PostgREST anon/authenticated roles. The app loads `content` via service role
-- and redacts it when the reader is not entitled.

revoke select (content) on table public.articles from anon, authenticated;
grant select (content) on table public.articles to service_role;
