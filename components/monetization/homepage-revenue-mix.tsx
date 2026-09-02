import { HousePartnerSlot } from "@/components/monetization/house-partner-slot";
import { NewsletterCapture } from "@/components/monetization/newsletter-capture";
import { ArticleSubscribeNudge } from "@/components/monetization/article-subscribe-nudge";
import { GlobalAdSlot } from "@/components/monetization/global-ad-slot";
import { TopLongevityProducts } from "@/components/monetization/affiliate-box";
import type { GlobalLocaleCode } from "@/lib/ecosystem/locales";

type Props = {
  locale: string;
  isVip?: boolean;
};

export async function HomepageRevenueMix({ locale, isVip = false }: Props) {
  return (
    <section className="mx-auto max-w-7xl space-y-5 px-4 py-8 sm:px-6">
      {!isVip ? (
        <GlobalAdSlot
          placement="in-content"
          locale={(locale as GlobalLocaleCode) ?? "cs"}
        />
      ) : null}
      <div className="grid gap-5 lg:grid-cols-2">
        {!isVip ? <HousePartnerSlot locale={locale} source="home-mid" /> : null}
        {!isVip ? <ArticleSubscribeNudge locale={locale} /> : null}
      </div>
      <TopLongevityProducts locale={(locale as GlobalLocaleCode) ?? "cs"} />
      <NewsletterCapture locale={locale} source="home" />
      {!isVip ? (
        <GlobalAdSlot
          placement="footer"
          locale={(locale as GlobalLocaleCode) ?? "cs"}
        />
      ) : null}
    </section>
  );
}
