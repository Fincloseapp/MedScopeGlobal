import { createServiceRoleClient } from "@/lib/supabase/service";
import { AdminVideoForm } from "@/components/academy/admin-video-form";
import { AdminVideoGenerateButton } from "@/components/academy/admin-video-generate-button";
import { AdminVideoLessonLink } from "@/components/academy/admin-video-lesson-link";

export default async function AdminAcademyVideoPage() {
  const admin = createServiceRoleClient();
  const [{ data: videos }, { data: lessons }] = await Promise.all([
    admin.from("video_assets").select("*").order("updated_at", { ascending: false }).limit(50),
    admin
      .from("lessons")
      .select("id, title, slug, video_asset_id")
      .order("title", { ascending: true })
      .limit(200),
  ]);

  const lessonList = lessons ?? [];

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600">
          Video assets — upload nebo AI generování (script + placeholder asset). HeyGen/Synthesia připraveno.
        </p>
        <div className="flex flex-wrap items-end gap-3">
          <AdminVideoGenerateButton lessons={lessonList} />
          <AdminVideoForm />
        </div>
      </div>
      <div className="mt-4 space-y-4">
        {(videos ?? []).map((row) => {
          const meta = (row.metadata ?? {}) as {
            public_url?: string;
            duration_source?: string;
            thumbnail_url?: string;
            render_status?: string;
            render_provider?: string;
            external_job_id?: string;
            pending_external_render?: boolean;
          };
          const linkedLesson = lessonList.find((l) => l.video_asset_id === row.id) ?? null;
          const renderLabel =
            meta.render_status === "processing" || row.status === "processing"
              ? "Renderuje se…"
              : meta.pending_external_render
                ? "Čeká na provider"
                : meta.render_provider
                  ? `Hotovo (${meta.render_provider})`
                  : row.status;
          return (
            <div
              key={row.id}
              className="overflow-hidden rounded-xl border border-slate-200 bg-white p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                {meta.thumbnail_url ? (
                  <img
                    src={meta.thumbnail_url}
                    alt={`Náhled: ${row.title}`}
                    className="h-20 w-36 shrink-0 rounded-lg border border-slate-100 object-cover"
                  />
                ) : null}
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-[#021d33]">{row.title}</p>
                  <p className="text-xs text-slate-500">
                    {row.status} · {row.duration_seconds ?? 0}s
                    {meta.duration_source ? ` (${meta.duration_source})` : ""}
                  </p>
                  <p className="mt-1 text-xs font-medium text-[#005B96]">Render: {renderLabel}</p>
                  {meta.external_job_id ? (
                    <p className="text-xs text-slate-400">Job: {meta.external_job_id}</p>
                  ) : null}
                  <p className="mt-1 text-xs text-slate-500">
                    {meta.public_url ? (
                      <a
                        href={meta.public_url}
                        className="text-[#005B96] hover:underline"
                        target="_blank"
                        rel="noreferrer"
                      >
                        {row.storage_path ?? "soubor"}
                      </a>
                    ) : (
                      row.storage_path ?? "—"
                    )}
                  </p>
                  {linkedLesson ? (
                    <p className="mt-1 text-xs text-green-700">
                      Propojeno: {linkedLesson.title}
                    </p>
                  ) : null}
                </div>
                <AdminVideoLessonLink
                  videoId={row.id}
                  videoTitle={row.title}
                  lessons={lessonList}
                  linkedLessonId={linkedLesson?.id ?? null}
                />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
