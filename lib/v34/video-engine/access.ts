import type { ContentAccessLevel } from "@/lib/config/access-levels";
import type { VideoMetadata } from "@/lib/v34/video-engine/types";

export type VideoAccessRole = "public" | "student" | "doctor";

export function mapUserToVideoRole(input: {
  isAuthenticated: boolean;
  isPhysician: boolean;
  isStudent?: boolean;
}): VideoAccessRole {
  if (input.isPhysician) return "doctor";
  if (input.isStudent || input.isAuthenticated) return "student";
  return "public";
}

const ROLE_RANK: Record<VideoAccessRole, number> = {
  public: 1,
  student: 2,
  doctor: 3,
};

export function canAccessVideo(
  userRole: VideoAccessRole,
  required: VideoAccessRole
): boolean {
  return ROLE_RANK[userRole] >= ROLE_RANK[required];
}

export function resolveVideoAccessFromMetadata(
  metadata: Record<string, unknown> | null | undefined
): VideoAccessRole {
  const raw = (metadata?.access_level ?? metadata?.audience ?? "public") as string;
  if (raw === "doctor" || raw === "physician") return "doctor";
  if (raw === "student") return "student";
  return "public";
}

export function gateVideoMetadata(
  meta: VideoMetadata,
  userRole: VideoAccessRole
): VideoMetadata | null {
  if (!canAccessVideo(userRole, meta.access)) return null;
  return meta;
}

export function contentLevelToVideoRole(level: ContentAccessLevel): VideoAccessRole {
  if (level === "physician") return "doctor";
  if (level === "student") return "student";
  return "public";
}
