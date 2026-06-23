import Link from "next/link";
import type { PublicAdCampaign } from "@/lib/queries/verejnost";

export function PublicAdBlock({
  campaign,
  variant = "inline",
}: {
  campaign: PublicAdCampaign;
  variant?: "banner" | "inline" | "sidebar" | "footer";
}) {
  const href = campaign.affiliate_url ?? "#";
  const isCompact = variant === "sidebar" || variant === "inline";

  return (
    <div
      className={
        variant === "banner"
          ? "my-8 rounded-2xl border border-dashed border-[#8dc4ea]/80 bg-[#f8fcff] p-5"
          : variant === "sidebar"
            ? "rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            : "my-6 rounded-2xl border border-dashed border-[#8dc4ea]/80 bg-[#f8fcff] p-4"
      }
      aria-label="Sponzorováno"
    >
      <span className="text-[9px] font-semibold uppercase tracking-wider text-[#005B96]">
        Sponzorováno
      </span>
      <p className={`font-semibold text-[#021d33] ${isCompact ? "mt-1 text-sm" : "mt-2 text-base"}`}>
        {campaign.title}
      </p>
      {campaign.body_html ? (
        <div
          className="prose prose-sm prose-slate mt-2 max-w-none text-slate-600"
          dangerouslySetInnerHTML={{ __html: campaign.body_html }}
        />
      ) : null}
      {href !== "#" ? (
        <Link
          href={href}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="mt-3 inline-block rounded-full bg-[#005B96] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#004a7a]"
        >
          {campaign.cta_text ?? "Více informací"}
        </Link>
      ) : null}
    </div>
  );
}

export function PublicAdBlocks({
  campaigns,
  variant,
}: {
  campaigns: PublicAdCampaign[];
  variant: "banner" | "inline" | "sidebar" | "footer";
}) {
  if (!campaigns.length) return null;
  return (
    <>
      {campaigns.map((c) => (
        <PublicAdBlock key={c.id} campaign={c} variant={variant} />
      ))}
    </>
  );
}
