-- Table-level SELECT still included `content` after column REVOKE.
-- Revoke row SELECT, then re-grant card/title columns only.

revoke select on table public.articles from public, anon, authenticated;

grant select (
  id, title, slug, excerpt, summary, cover_image_url, cover_image, image_url,
  category_id, author_id, published, published_at, created_at, updated_at,
  vip_only, rubric_slug, min_access_level, audience, public_topic, locale,
  source_url, source_name, quiz_json, meta_description, seo_title, seo_description,
  seo_keywords, ai_generated, metadata, med_track, study_year, student_topic,
  prijimacky_topic, reading_time, reading_time_minutes, learning_objectives,
  section_slug, domain_slug, content_type, difficulty_group, ingested_at,
  hash_dedup, license, is_machine_translated, is_premium, parent_article_id
) on table public.articles to anon, authenticated;

grant select on table public.articles to service_role, postgres;
