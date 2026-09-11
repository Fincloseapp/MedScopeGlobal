export const EXCHANGE_ROLES = [
  "Owner",
  "Admin",
  "CompanyAdmin",
  "InstitutionAdmin",
  "StandardUser",
  "Guest",
] as const;

export type ExchangeRole = (typeof EXCHANGE_ROLES)[number];

export const EXCHANGE_ROLE_DB: Record<Exclude<ExchangeRole, "Guest">, string> = {
  Owner: "owner",
  Admin: "admin",
  CompanyAdmin: "company_admin",
  InstitutionAdmin: "institution_admin",
  StandardUser: "standard_user",
};

export function parseExchangeRole(value: unknown): ExchangeRole {
  if (value === "Owner" || value === "owner") return "Owner";
  if (value === "Admin" || value === "admin") return "Admin";
  if (value === "CompanyAdmin" || value === "company_admin") return "CompanyAdmin";
  if (value === "InstitutionAdmin" || value === "institution_admin") return "InstitutionAdmin";
  if (value === "StandardUser" || value === "standard_user") return "StandardUser";
  return "Guest";
}

export function canManageOrganization(role: ExchangeRole): boolean {
  return role === "Owner" || role === "Admin" || role === "CompanyAdmin" || role === "InstitutionAdmin";
}

export function canPublishListing(role: ExchangeRole): boolean {
  return canManageOrganization(role);
}

export function canApproveListings(role: ExchangeRole): boolean {
  return role === "Owner" || role === "Admin";
}

export function canManageAds(role: ExchangeRole): boolean {
  return role === "Owner" || role === "Admin";
}

export function canSubmitDemand(role: ExchangeRole): boolean {
  return role === "Owner" || role === "Admin" || role === "InstitutionAdmin" || role === "CompanyAdmin";
}

/** Platform `users.role` + membership → effective Exchange role. Guest if unauthenticated. */
export function effectiveExchangeRole(opts: {
  authenticated: boolean;
  platformRole?: string | null;
  membershipRole?: string | null;
}): ExchangeRole {
  if (!opts.authenticated) return "Guest";
  const platform = (opts.platformRole ?? "").toLowerCase();
  if (platform === "owner") return "Owner";
  if (platform === "admin") return "Admin";
  return parseExchangeRole(opts.membershipRole);
}
