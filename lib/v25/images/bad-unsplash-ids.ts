/**
 * Hard denylist — delegates to autonomous editorial image policy.
 * @deprecated Prefer `@/lib/editorial/image-policy` directly.
 */
export {
  ALL_BANNED_IDS as BAD_UNSPLASH_IDS,
  hasBannedCoverId as hasBadUnsplashId,
  isBannedCoverUrl,
} from "@/lib/editorial/image-policy";
