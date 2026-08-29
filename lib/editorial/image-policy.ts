/**
 * TypeScript surface for editorial image policy (Next.js app imports).
 * Implementation lives in image-policy.mjs — keep API in sync.
 */
export {
  ALL_BANNED_IDS,
  ALLOWED_UNSPLASH_IDS,
  AUDIENCE_GUIDANCE,
  BAD_UNSPLASH_IDS,
  BANNED_COVER_IDS,
  BANNED_STOCK_IDS,
  BANNED_VISUAL_KEYWORDS,
  EDITORIAL_IMAGE_POLICY_VERSION,
  LAPTOP_BRAND_COVERS,
  LOCAL_MAGAZINE_COVERS,
  MEDSCOPE_SCREEN_BRANDING,
  SAFE_CURATED_PHOTOS,
  buildEditorialImageGuidance,
  curatedCoverForModule,
  hasBadUnsplashId,
  hasBannedCoverId,
  isBannedCoverUrl,
  isLaptopSceneHint,
  matchesBannedVisualKeyword,
  pickLaptopBrandCover,
  resolveEditorialCover,
  resolveTopicModule,
  scoreCoverCandidate,
} from "./image-policy.mjs";
