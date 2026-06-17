import { getDigestDeliveryStatus } from "@/lib/academy/marketing/digest-config";
import { isExpertReviewAutoPublishEnabled, getVideoWebhookUrl } from "@/lib/academy/settings";
import { isHeyGenConfigured, isSynthesiaConfigured, getPreferredVideoProvider } from "@/lib/academy/ai/video-providers";

export function VideoProviderBadge() {
  const provider = getPreferredVideoProvider();
  const heygen = isHeyGenConfigured();
  const synthesia = isSynthesiaConfigured();

  const label =
    provider === "heygen"
      ? "HeyGen — externí render aktivní"
      : provider === "synthesia"
        ? "Synthesia — externí render aktivní"
        : "Placeholder MP4 — nastavte HEYGEN_API_KEY";

  const tone =
    provider === "placeholder"
      ? "border-amber-200 bg-amber-50 text-amber-900"
      : "border-green-200 bg-green-50 text-green-800";

  return (
    <div className={`rounded-xl border px-4 py-3 text-sm ${tone}`}>
      <p className="font-medium">Video pipeline: {label}</p>
      <p className="mt-1 text-xs opacity-90">
        Webhook: <code className="text-xs">{getVideoWebhookUrl()}</code>
        {heygen ? " · HeyGen ✓" : ""}
        {synthesia ? " · Synthesia ✓" : ""}
        {!heygen && !synthesia ? (
          <>
            {" "}
            · Viz <code className="text-xs">D:\medscope.data\docs\academy-video-providers.md</code>
          </>
        ) : null}
      </p>
    </div>
  );
}

export function ExpertReviewCronBadge() {
  const autoPublish = isExpertReviewAutoPublishEnabled();
  const digest = getDigestDeliveryStatus();

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
      <p className="font-medium">
        Expert review cron: auto-publish {autoPublish ? "zapnuto" : "vypnuto"}
      </p>
      <p className="mt-1 text-xs text-slate-500">
        Cron <code>/api/cron/academy-weekly</code> řadí expert-review pro AI draft kurzy/lekcí.
        Env <code>ACADEMY_EXPERT_REVIEW_AUTO_PUBLISH</code> (default true). Digest: {digest.mode}.
      </p>
    </div>
  );
}
