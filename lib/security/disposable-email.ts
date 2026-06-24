const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com",
  "guerrillamail.com",
  "tempmail.com",
  "10minutemail.com",
  "yopmail.com",
  "throwaway.email",
  "temp-mail.org",
  "fakeinbox.com",
  "sharklasers.com",
  "trashmail.com",
]);

export function extractEmailDomain(email: string): string {
  const at = email.lastIndexOf("@");
  if (at < 0) return "";
  return email.slice(at + 1).toLowerCase().trim();
}

export function isDisposableEmail(email: string): boolean {
  const domain = extractEmailDomain(email);
  return DISPOSABLE_DOMAINS.has(domain);
}

export async function checkEmailDomainAllowed(
  email: string,
  adminCheck?: (domain: string) => Promise<"allow" | "deny" | null>
): Promise<{ allowed: boolean; reason?: string }> {
  const domain = extractEmailDomain(email);
  if (!domain) return { allowed: false, reason: "invalid_domain" };

  if (isDisposableEmail(email)) {
    return { allowed: false, reason: "disposable_email" };
  }

  if (adminCheck) {
    const rule = await adminCheck(domain);
    if (rule === "deny") return { allowed: false, reason: "domain_denied" };
    if (rule === "allow") return { allowed: true };
  }

  return { allowed: true };
}
