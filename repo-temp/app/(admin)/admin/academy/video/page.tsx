import { createServiceRoleClient } from "@/lib/supabase/service";

import { AdminVideoForm } from "@/components/academy/admin-video-form";

import { AdminVideoGenerateButton } from "@/components/academy/admin-video-generate-button";

import { AdminVideoLessonLink } from "@/components/academy/admin-video-lesson-link";

import { AdminVideoRetryButton } from "@/components/academy/admin-video-retry-button";

import {

  getPreferredVideoProvider,

  getVideoProviderChain,

  isHeyGenConfigured,

  isMuxConfigured,

  isOpenAiTtsConfigured,

  isSynthesiaConfigured,

} from "@/lib/academy/ai/video-providers";



const PLACEHOLDER_MP4 =

  "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";



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

  const provider = getPreferredVideoProvider();

  const chain = getVideoProviderChain();



  return (

    <>

      <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">

        <p className="font-medium text-[#021d33]">Video provider pipeline</p>

        <p className="mt-1 text-slate-600">

          Aktivní: <strong>{provider}</strong> · Řetězec: {chain.join(" → ")}

        </p>

        <ul className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">

          <li>HeyGen: {isHeyGenConfigured() ? "✓" : "—"}</li>

          <li>Synthesia: {isSynthesiaConfigured() ? "✓" : "—"}</li>

          <li>OpenAI TTS: {isOpenAiTtsConfigured() ? "✓" : "—"}</li>

          <li>Mux: {isMuxConfigured() ? "✓" : "—"}</li>

        </ul>

      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">

        <p className="text-sm text-slate-600">

          Video assets — upload, AI pipeline (script → TTS/avatar → webhook → Mux).

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

            lesson_format?: string;

            tts_audio_url?: string;

          };

          const linkedLesson = lessonList.find((l) => l.video_asset_id === row.id) ?? null;

          const isProcessing =

            meta.render_status === "processing" || row.status === "processing";

          const isPlaceholder =

            meta.public_url === PLACEHOLDER_MP4 ||

            meta.render_provider === "placeholder" ||

            (meta.pending_external_render && !meta.tts_audio_url);

          const renderLabel = isProcessing

            ? "Renderuje se…"

            : meta.lesson_format === "audio_lesson"

              ? `Audio lekce (${meta.render_provider ?? "openai_tts"})`

              : meta.pending_external_render

                ? "Čeká na provider"

                : meta.render_provider

                  ? `Hotovo (${meta.render_provider})`

                  : row.status;

          const canRetry =

            !isProcessing && (isPlaceholder || row.status === "failed" || meta.render_status === "failed");



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

                    {meta.public_url || meta.tts_audio_url ? (

                      <a

                        href={meta.tts_audio_url ?? meta.public_url}

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

                <div className="flex flex-col items-end gap-2">

                  <AdminVideoRetryButton

                    videoAssetId={row.id}

                    canRetry={canRetry}

                    renderStatus={meta.render_status}

                  />

                  <AdminVideoLessonLink

                    videoId={row.id}

                    videoTitle={row.title}

                    lessons={lessonList}

                    linkedLessonId={linkedLesson?.id ?? null}

                  />

                </div>

              </div>

            </div>

          );

        })}

      </div>

    </>

  );

}


