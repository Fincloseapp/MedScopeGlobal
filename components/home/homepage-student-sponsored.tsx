import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Download } from "lucide-react";
import { mediprepHouseStudentCampaigns } from "@/lib/marketing/helpers";
import { MEDIPREP } from "@/lib/prep/branding";

export function HomepageStudentSponsored() {
  const shown = mediprepHouseStudentCampaigns();

  return (
    <div className="mt-6">
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-lime-300">
        MeDiprep
      </p>
      <div className="grid gap-4 lg:grid-cols-2">
        {shown.map((campaign, i) => {
          const href = campaign.affiliate_url || "/mediprep/stahnout";
          const download = href.includes("/stahnout") || href.includes("install=1");
          const art = i === 0 ? MEDIPREP.assets.promo : MEDIPREP.assets.social;
          const alt = i === 0 ? MEDIPREP.promoLine : MEDIPREP.socialLine;
          return (
            <article
              key={campaign.id}
              className="overflow-hidden rounded-2xl border border-cyan-400/20 bg-[#07111F] shadow-sm"
            >
              <Link href={href} className="block">
                <Image
                  src={art}
                  alt={`${MEDIPREP.shortName} – ${alt}`}
                  width={i === 0 ? 1600 : 1200}
                  height={i === 0 ? 900 : 630}
                  className={
                    i === 0
                      ? "aspect-[4/3] h-auto w-full bg-[#07111F] object-cover object-[center_38%] sm:aspect-[16/9] sm:object-center"
                      : "aspect-[1200/630] h-auto w-full bg-[#07111F] object-contain object-center"
                  }
                />
              </Link>
              <div className="p-5">
                <p className="font-semibold text-white">{campaign.title}</p>
                {campaign.body_html ? (
                  <div
                    className="prose prose-sm prose-invert mt-2 max-w-none text-sky-100/80"
                    dangerouslySetInnerHTML={{ __html: campaign.body_html }}
                  />
                ) : null}
                <Link
                  href={href}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#F97316] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#ea6a0c]"
                >
                  {download ? <Download className="h-3.5 w-3.5" /> : <ArrowRight className="h-3.5 w-3.5" />}
                  {campaign.cta_text ?? MEDIPREP.startCta}
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
