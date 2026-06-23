-- Ensure Editor's pick articles are fully open (vip_only = false)
UPDATE public.articles
SET
  vip_only = false,
  quiz_json = COALESCE(quiz_json, '{}'::jsonb) || '{"editors_pick": true}'::jsonb,
  updated_at = now()
WHERE slug IN (
  'kardiologie-nemoci-srdce-a-cv',
  'neurologie-shrnut',
  'endokrinologie-zkladn-onemocnn-a-diagnostika',
  'diagnostika-revmatologickch-onemocnn-klov-kroky',
  'prevence-nemoc'
);
