-- Optional demo partner + sample accredited course shell (safe to re-run)

insert into public.partner_institutions (name, slug, logo_url, contact_email, is_active)
values (
  'Demo Lékařská Akademie',
  'demo-lekarska-akademie',
  null,
  'partner@medscopeglobal.com',
  true
)
on conflict (slug) do update
set name = excluded.name,
    contact_email = excluded.contact_email,
    is_active = true,
    updated_at = now();

-- Attach B2B fields to an existing published course if present (no-op otherwise)
update public.courses c
set
  accreditation_number = coalesce(c.accreditation_number, 'CLK-DEMO-2026-001'),
  credits_count = greatest(c.credits_count, 2),
  requires_verified_doctor = true,
  passing_threshold = 80,
  partner_institution_id = (
    select id from public.partner_institutions where slug = 'demo-lekarska-akademie' limit 1
  )
where c.status = 'published'
  and c.slug in (
    select slug from public.courses
    where status = 'published'
    order by updated_at desc
    limit 1
  )
  and c.accreditation_number is null;
