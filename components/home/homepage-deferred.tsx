import dynamic from "next/dynamic";
import type { AccessLevelId } from "@/lib/config/access-levels";
import type { LocaleCode } from "@/lib/i18n/config";

const HomepageAutomation = dynamic(
  () => import("@/components/home/homepage-automation").then((m) => m.HomepageAutomation),
  { loading: () => <div className="h-32 animate-pulse bg-[#f6fbff]" aria-hidden /> }
);

const V19ArticleBriefFeedLazy = dynamic(
  () => import("@/components/v19/article-brief-feed").then((m) => m.V19ArticleBriefFeedLazy),
  { loading: () => <div className="h-24 animate-pulse bg-white" aria-hidden /> }
);

export function HomepageDeferredSections({
  locale,
  isVip,
  accessLevel,
  briefTitle,
}: {
  locale: LocaleCode;
  isVip: boolean;
  accessLevel: AccessLevelId;
  briefTitle: string;
}) {
  return (
    <>
      <V19ArticleBriefFeedLazy title={briefTitle} limit={4} locale="auto" />
      <HomepageAutomation locale={locale} isVip={isVip} accessLevel={accessLevel} />
    </>
  );
}
