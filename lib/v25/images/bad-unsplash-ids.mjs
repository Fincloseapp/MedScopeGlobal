/**
 * Hard denylist — delegates to autonomous editorial image policy.
 */
export {
  ALL_BANNED_IDS as BAD_UNSPLASH_IDS,
  hasBannedCoverId as hasBadUnsplashId,
  isBannedCoverUrl,
} from "../../editorial/image-policy.mjs";
