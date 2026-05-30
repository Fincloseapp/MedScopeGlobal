import type { ArticleStatus, PortalRole, SessionUser, VerificationStatus } from "./types";

const permissions = {
  "articles:read": ["reader", "expert", "admin"] as PortalRole[],
  "articles:save": ["reader", "expert", "admin"] as PortalRole[],
  "articles:rate": ["reader", "expert", "admin"] as PortalRole[],
  "articles:create": ["expert", "admin"] as PortalRole[],
  "articles:edit": ["expert", "admin"] as PortalRole[],
  "articles:delete": ["expert", "admin"] as PortalRole[],
  "articles:publish": ["expert", "admin"] as PortalRole[],
  "articles:validate": ["expert", "admin"] as PortalRole[],
  "articles:generate": ["expert", "admin"] as PortalRole[],
  "admin:verify-experts": ["admin"] as PortalRole[]
} as const;

export type Permission = keyof typeof permissions;

export function hasPermission(user: SessionUser | null | undefined, permission: Permission): boolean {
  if (!user) return permission === "articles:read";
  if (!permissions[permission].includes(user.role)) return false;
  if (permission.startsWith("articles:") && permission !== "articles:read" && permission !== "articles:save" && permission !== "articles:rate") {
    return isVerifiedExpert(user);
  }
  return true;
}

export function isVerifiedExpert(user: SessionUser): boolean {
  if (user.role === "admin") return true;
  if (user.role !== "expert") return false;
  return user.verificationStatus === "approved";
}

export function canReadArticle(status: ArticleStatus, user: SessionUser | null | undefined): boolean {
  if (status === "published") return true;
  if (!user) return false;
  if (user.role === "admin") return true;
  return isVerifiedExpert(user);
}

export function canEditArticle(authorId: string, user: SessionUser): boolean {
  if (user.role === "admin") return true;
  if (!isVerifiedExpert(user)) return false;
  return authorId === user.id;
}

export const verifiedExpertDomains = [
  "lf1.cuni.cz",
  "lf2.cuni.cz",
  "lf3.cuni.cz",
  "cuni.cz",
  "med.muni.cz",
  "lf.upol.cz",
  "fnhk.cz",
  "fnbrno.cz",
  "vfn.cz",
  "ikem.cz",
  "motol.cz",
  "fnol.cz",
  "fnbul.cz"
];

export function resolveVerificationStatus(email: string, role: PortalRole): VerificationStatus {
  if (role === "reader") return "not_required";
  const domain = email.split("@")[1]?.toLowerCase() ?? "";
  if (verifiedExpertDomains.some((item) => domain === item || domain.endsWith(`.${item}`))) {
    return "approved";
  }
  return "pending";
}
