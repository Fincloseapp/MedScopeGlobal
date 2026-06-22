export function getV19UxListing() {
  return {
    version: "v19.8",
    mobile: {
      skeletonLoading: true,
      lazyLoading: true,
      horizontalScroll: false,
      tables: false,
      iosAndroidOptimized: true,
    },
    components: [
      "V19ArticleBriefCard",
      "V19ArticleBriefSkeleton",
      "V19ArticleBriefFeedLazy",
      "V19ArticleBody",
      "V19NzipTopicCard",
    ],
    nzipUx: {
      topicCards: true,
      categoryBadges: true,
      tagChips: true,
      glossaryLinks: true,
    },
    classes: ["v19-brief-card", "v19-nzip-topic-card", "overflow-x-hidden"],
  };
}
