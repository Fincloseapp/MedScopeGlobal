import { AlertTriangle } from "lucide-react";
import { enrichLessonContent, extractLessonMetadata } from "@/lib/v35/content-validation/enrichLesson";
import { validateLessonContent } from "@/lib/v35/content-validation/validateLesson";
import { scoreTopicAlignment, extractSlideshowManifest } from "@/lib/v25/video/content-slideshow";

type Props = {
  title: string;
  content: string;
  contentJson: Record<string, unknown>;
  videoTitle?: string;
  videoDescription?: string;
  slideshowTopic?: string;
};

export async function LessonMetadataBlock({
  title,
  content,
  contentJson,
  videoTitle,
  videoDescription,
  slideshowTopic,
}: Props) {
  const existing = extractLessonMetadata(contentJson);
  const enrichment = await enrichLessonContent({ title, content, existing });
  const slideshow = extractSlideshowManifest(contentJson, null);
  const alignmentScore = slideshow ? scoreTopicAlignment(title, slideshow) : undefined;

  const validation = await validateLessonContent({
    lessonTitle: title,
    lessonContent: content,
    videoTitle,
    videoDescription,
    slideshowTopic: slideshowTopic ?? slideshow?.topic,
    alignmentScore,
  });

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="font-display text-lg font-semibold text-[#021d33]">O lekci</h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-700">{enrichment.summary}</p>
      {enrichment.key_points.length > 0 ? (
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#005B96]">Klíčové body</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
            {enrichment.key_points.map((point, i) => (
              <li key={i}>{point}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {slideshow && alignmentScore !== undefined ? (
        <p className="mt-4 text-xs text-emerald-800">
          Video prezentace odpovídá tématu lekce (shoda {Math.round(alignmentScore * 100)} %).
        </p>
      ) : null}
      {validation.content_mismatch ? (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>Obsah lekce a video mohou být nesouladné — tým Academy to ověří.</span>
        </div>
      ) : null}
    </section>
  );
}
