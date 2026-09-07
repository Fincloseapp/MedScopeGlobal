import Link from "next/link";
import { PublicHealthVideoCard } from "@/components/verejnost/public-health-video-card";
import { SocialShareStrip } from "@/components/social/social-share-strip";
import { getShareCopy } from "@/lib/i18n/share-copy";
import { localizePublicHref } from "@/lib/i18n/nav-copy";
import { translatePublicTitle } from "@/lib/verejnost/translate-public-text";
import { getTodayPublicHealthVideo, listPublicHealthVideos } from "@/lib/verejnost/osveta/db";

async function renderClips(locale: string) {
  const copy = getShareCopy(locale);
  const [today, listed] = await Promise.all([
    getTodayPublicHealthVideo(),
    listPublicHealthVideos({ limit: 3 }),
  ]);
  const extra = listed.filter((row) => row.id !== today?.id).slice(0, 1);
  const clips = [...(today ? [today] : []), ...extra];
  if (clips.length === 0) return null;

  const shareTitle = today
    ? await translatePublicTitle(today.title, locale, copy.clipsTitle)
    : copy.clipsTitle;
  const sharePath = today ? `/verejnost/osveta/${today.slug}` : "/verejnost/osveta";

  return (
    <section className="mx-auto max-w-7xl px-4 pb-2 sm:px-6" aria-labelledby="homepage-clips-title">
      <div className="rounded-xl border border-[#d7e6f4] bg-white px-5 py-6 sm:px-7">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#005B96]">{copy.clipsEyebrow}</p>
        <h2 id="homepage-clips-title" className="mt-1 font-display text-2xl font-semibold text-[#021d33]">
          {copy.clipsTitle}
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">{copy.clipsLead}</p>
        <div className={`mt-5 grid gap-4 ${clips.length > 1 ? "md:grid-cols-2" : ""}`}>
          {clips.map((video, index) => (
            <PublicHealthVideoCard key={video.id} video={video} featured={index === 0 && clips.length === 1} locale={locale} />
          ))}
        </div>
        <div className="mt-5">
          <SocialShareStrip title={shareTitle} path={sharePath} locale={locale} />
        </div>
        <nav className="mt-4 flex flex-wrap gap-2" aria-label={copy.clipsTitle}>
          <Link
            href={localizePublicHref("/predplatne#public", locale)}
            className="inline-flex items-center rounded-full bg-[#005B96] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[#004a7a]"
          >
            {copy.clipsSubscribe}
          </Link>
          <Link
            href={localizePublicHref("/firmy/reklama/nova", locale)}
            className="inline-flex items-center rounded-full border border-[#005B96]/25 bg-white px-3 py-1.5 text-sm font-semibold text-[#005B96] hover:bg-[#005B96]/5"
          >
            {copy.clipsAds}
          </Link>
          <Link
            href={localizePublicHref("/verejnost/osveta", locale)}
            className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
          >
            {copy.clipsLibrary}
          </Link>
        </nav>
      </div>
    </section>
  );
}

export async function HomepageClipsStrip({ locale }: { locale: string }) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      renderClips(locale),
      new Promise<null>((resolve) => {
        timer = setTimeout(() => resolve(null), 1_500);
      }),
    ]);
  } catch {
    return null;
  } finally {
    if (timer) clearTimeout(timer);
  }
}
