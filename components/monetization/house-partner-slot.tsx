import Link from "next/link";
import { getRevenueCopy } from "@/lib/i18n/revenue-copy";
import { localizePublicHref } from "@/lib/i18n/nav-copy";

type Props = {
  locale?: string;
  source: string;
  className?: string;
};

/** Unsold inventory that sells itself — first-party B2B, no AdSense required. */
export function HousePartnerSlot({ locale = "cs", source, className = "" }: Props) {
  const copy = getRevenueCopy(locale);
  const href = `${localizePublicHref("/inzerce/formular", locale)}?from=${encodeURIComponent(source)}`;

  return (
    <aside
      className={`rounded-2xl border border-dashed border-[#005B96]/35 bg-[#f0f7ff] px-5 py-4 ${className}`}
      data-house-ad="partner"
      data-house-source={source}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#005B96]">
        {copy.partnerKicker}
      </p>
      <p className="mt-1 font-display text-lg font-semibold text-[#021d33]">{copy.partnerTitle}</p>
      <p className="mt-1 text-sm leading-relaxed text-slate-600">{copy.partnerBody}</p>
      <Link
        href={href}
        className="mt-3 inline-flex h-10 items-center rounded-full bg-[#005B96] px-4 text-sm font-semibold text-white hover:bg-[#004a7a]"
      >
        {copy.partnerCta}
      </Link>
    </aside>
  );
}
