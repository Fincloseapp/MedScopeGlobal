-- Run in Supabase SQL Editor: private bucket for profession verification uploads
insert into storage.buckets (id, name, public)
values ('verification-documents', 'verification-documents', true)
on conflict (id) do nothing;
