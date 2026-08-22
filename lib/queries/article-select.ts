/** Public/listing columns — omits `content` and `quiz_json` so anon cannot select bodies. */
export const ARTICLE_CARD_SELECT = `
  id, title, slug, excerpt, summary, cover_image_url, cover_image, image_url,
  category_id, author_id, published, published_at, created_at, updated_at,
  vip_only, rubric_slug, min_access_level, audience, public_topic, locale,
  source_url, source_name, meta_description, seo_title, seo_description,
  seo_keywords, ai_generated, metadata, med_track, study_year, student_topic,
  prijimacky_topic, reading_time, reading_time_minutes, learning_objectives,
  section_slug, domain_slug, content_type, difficulty_group, ingested_at,
  hash_dedup, license, is_machine_translated, is_premium, parent_article_id,
  categories ( id, name, slug ),
  users!author_id ( id, full_name, avatar_url )
`;

/** Body fields loaded only via service role after an access check. */
export const ARTICLE_GATED_SELECT = "content, quiz_json";
