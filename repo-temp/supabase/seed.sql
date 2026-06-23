-- Optional seed data (run after migration in SQL Editor)
-- Replace YOUR_ADMIN_USER_ID with your Supabase Auth user UUID before promoting admin.

insert into public.categories (name, slug, description)
values
  (
    'Digital Medicine',
    'digital-medicine',
    'AI, telehealth, and clinical informatics shaping modern care.'
  ),
  (
    'Global Health',
    'global-health',
    'Population health, policy, and cross-border collaboration.'
  ),
  (
    'Clinical Practice',
    'clinical-practice',
    'Evidence-based pathways and frontline care delivery.'
  )
on conflict (slug) do nothing;

-- Promote first admin (uncomment and set UUID after you sign up):
-- update public.users set role = 'admin' where id = 'YOUR_ADMIN_USER_ID';
