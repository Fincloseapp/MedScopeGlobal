"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Info, X } from "lucide-react";

export type VideoSourceKind = "medscope" | "fallback_w3schools" | "external_cdn" | "supabase";

type Props = {
  children: React.ReactNode;
  lessonTitle?: string;
  variant?: "academy" | "osveta";
  sourceKind?: VideoSourceKind;
  sourceLabel?: string;
  dismissible?: boolean;
  className?: string;
};

const STORAGE_KEY = "ms_video_legal_notice_dismissed";

export function detectVideoSource(
  url: string,
  isFallback: boolean
): { kind: VideoSourceKind; label?: string } {
  if (isFallback || url.includes("w3schools.com")) {
    return { kind: "fallback_w3schools", label: "w3schools.com (ukázkové záložní video)" };
  }
  if (url.includes("supabase.co") || url.includes("supabase.in")) {
    return { kind: "supabase", label: "Supabase Storage CDN" };
  }
  if (url.includes("medscopeglobal.com")) {
    return { kind: "medscope" };
  }
  try {
    return { kind: "external_cdn", label: new URL(url).hostname };
  } catch {
    return { kind: "external_cdn" };
  }
}

export function VideoLegalNotice({
  children,
  lessonTitle,
  variant = "academy",
  sourceKind = "medscope",
  sourceLabel,
  dismissible = true,
  className,
}: Props) {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    try {
      setDismissed(localStorage.getItem(STORAGE_KEY) === "1");
    } catch {
      setDismissed(false);
    }
  }, []);

  const dismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* storage unavailable */
    }
  };

  // Osvěta: never surface storage CDN hostnames — looks unprofessional to readers.
  const showSource =
    variant === "osveta"
      ? sourceKind === "fallback_w3schools" || sourceKind === "external_cdn"
      : sourceKind === "fallback_w3schools" ||
        sourceKind === "external_cdn" ||
        sourceKind === "supabase";

  const brand = variant === "osveta" ? "MedScope Osvěta" : "MedScope Academy";

  return (
    <div className={className}>
      {!dismissed ? (
        variant === "osveta" ? (
          <aside
            role="note"
            aria-label="Právní upozornění k lekci"
            className="mb-3 flex items-start gap-2 rounded-xl border border-[#d7e6f4] bg-[#f4f8fc] px-3.5 py-2.5 text-xs leading-relaxed text-slate-600"
          >
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#005B96]" aria-hidden />
            <p className="min-w-0 flex-1">
              Obecná zdravotní osvěta — nenahrazuje radu lékaře.{" "}
              <Link href="/terms#video-content" className="font-medium text-[#005B96] underline-offset-2 hover:underline">
                Podmínky
              </Link>
            </p>
            {dismissible ? (
              <button
                type="button"
                onClick={dismiss}
                className="shrink-0 rounded p-1 text-slate-500 hover:bg-white"
                aria-label="Skrýt upozornění"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </aside>
        ) : (
          <aside
            role="note"
            aria-label="Právní upozornění k videu"
            className="mb-3 rounded-xl border border-sky-200 bg-sky-50/90 px-4 py-3 text-xs leading-relaxed text-sky-950"
          >
            <div className="flex items-start gap-2">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-sky-700" aria-hidden />
              <div className="min-w-0 flex-1 space-y-2">
                <p className="font-semibold">Vzdělávací video — nenahrazuje odbornou péči</p>
                <ul className="list-disc space-y-1 pl-4">
                  <li>
                    Obsah nenahrazuje individuální lékařskou radu, diagnózu ani léčbu. Pro zdravotní
                    rozhodnutí vždy konzultujte kvalifikovaného odborníka.
                  </li>
                  <li>
                    Materiály slouží výhradně ke vzdělávání zdravotnických pracovníků a informování
                    veřejnosti — nejsou určeny k samoléčbě.
                  </li>
                  <li>
                    Obsah splňuje vzdělávací standard {brand} a není reklamou na léčivé přípravky ani
                    zdravotnické prostředky (zákon č. 40/1995 Sb., reklama na zdravotnické prostředky).
                  </li>
                </ul>
                <p className="text-sky-800/90">
                  <span className="font-medium">EN:</span> For educational purposes only — not a substitute
                  for professional medical advice. Not intended for self-diagnosis or treatment.
                </p>
                <p>
                  Podrobnosti:{" "}
                  <Link href="/terms#video-content" className="font-medium underline hover:text-sky-900">
                    Obchodní podmínky
                  </Link>
                  {" · "}
                  <Link href="/privacy#video-analytics" className="font-medium underline hover:text-sky-900">
                    Ochrana soukromí
                  </Link>
                </p>
              </div>
              {dismissible ? (
                <button
                  type="button"
                  onClick={dismiss}
                  className="shrink-0 rounded p-1 text-sky-700 hover:bg-sky-100"
                  aria-label="Skrýt upozornění"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </div>
          </aside>
        )
      ) : null}

      {children}

      <footer className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-500">
        <span>© {brand}</span>
        <Link href="/terms#video-content" className="underline hover:text-slate-700">
          Licence obsahu
        </Link>
        {lessonTitle ? (
          <span className="sr-only"> — {lessonTitle}</span>
        ) : null}
        {showSource && sourceLabel ? (
          <span className="text-slate-400">Zdroj videa: {sourceLabel}</span>
        ) : null}
      </footer>
    </div>
  );
}

type SubtitleCue = { start_seconds: number; end_seconds: number; text: string };

function formatVttTime(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  const ms = Math.round((sec % 1) * 1000);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(ms).padStart(3, "0")}`;
}

/** Build an in-memory WebVTT URL from lesson subtitle cues (revoked by caller on unmount). */
export function buildCaptionsVttUrl(subtitles: SubtitleCue[]): string {
  const body = subtitles
    .map(
      (cue) =>
        `${formatVttTime(cue.start_seconds)} --> ${formatVttTime(cue.end_seconds)}\n${cue.text.trim()}`
    )
    .join("\n\n");
  return URL.createObjectURL(new Blob([`WEBVTT\n\n${body}`], { type: "text/vtt" }));
}

export function extractCaptionSource(meta: Record<string, unknown>): {
  vttUrl: string | null;
  subtitles: SubtitleCue[] | null;
} {
  const urlFields = ["caption_vtt_url", "captions_url", "vtt_url", "subtitle_url"];
  for (const key of urlFields) {
    const val = meta[key];
    if (typeof val === "string" && val.startsWith("http")) {
      return { vttUrl: val, subtitles: null };
    }
  }
  const raw = meta.subtitles;
  if (Array.isArray(raw) && raw.length > 0) {
    const subtitles = raw.filter(
      (c): c is SubtitleCue =>
        typeof c === "object" &&
        c !== null &&
        typeof (c as SubtitleCue).text === "string" &&
        typeof (c as SubtitleCue).start_seconds === "number"
    );
    if (subtitles.length) return { vttUrl: null, subtitles };
  }
  return { vttUrl: null, subtitles: null };
}
