-- v31 performance indexes

create index if not exists courses_slug_idx on public.courses (slug);

create index if not exists lessons_course_id_idx on public.lessons (course_id);

create index if not exists video_assets_status_idx on public.video_assets (status);

create index if not exists public_health_videos_published_at_idx
  on public.public_health_videos (published_at desc nulls last);
