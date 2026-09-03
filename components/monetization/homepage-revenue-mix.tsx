import { HousePartnerSlot } from "@/components/monetization/house-partner-slot";
import { NewsletterCapture } from "@/components/monetization/newsletter-capture";
import { ArticleSubscribeNudge } from "@/components/monetization/article-subscribe-nudge";
import { MagazineAdUnit } from "@/components/monetization/magazine-ad-unit";

type Props = {
  locale: string;
  isVip?: boolean;
};

export async function HomepageRevenueMix({ locale, isVip = false }: Props) {
  return (
    <section className="mx-auto max-w-7xl space-y-5 px-4 py-8 sm:px-6">
      <MagazineAdUnit locale={locale} />
      <div className="grid gap-5 lg:grid-cols-2">
        {!isVip ? <HousePartnerSlot locale={locale} source="home-mid" /> : null}
        {!isVip ? <ArticleSubscribeNudge locale={locale} /> : null}
      </div>
      <NewsletterCapture locale={locale} source="home" />
    </section>
  );
}
