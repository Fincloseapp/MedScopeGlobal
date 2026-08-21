/** Normalized account / entitlement status shown in all three app shells. */

export type AppAccessInfo = {
  authenticated: boolean;
  /** Display name or e-mail, or "Nepřihlášeni" */
  accountLabel: string;
  email: string | null;
  /** Plan / entitlement short label */
  planLabel: string;
  entitled: boolean;
  /** ISO date string when subscription ends, if known */
  validUntil: string | null;
  /** Czech human label for validity */
  validityLabel: string;
  loginUrl: string;
  subscribeUrl: string;
};

export function formatValidityDateCs(iso: string | null | undefined): string | null {
  if (!iso) return null;
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleDateString("cs-CZ", { day: "numeric", month: "numeric", year: "numeric" });
  } catch {
    return null;
  }
}

export function buildValidityLabel(opts: {
  authenticated: boolean;
  entitled: boolean;
  endsAt: string | null;
  guestHint?: string;
}): string {
  if (!opts.authenticated) {
    return opts.guestHint ?? "po přihlášení";
  }
  const formatted = formatValidityDateCs(opts.endsAt);
  if (formatted) {
    if (opts.endsAt && new Date(opts.endsAt) < new Date()) {
      return `vypršelo ${formatted}`;
    }
    return `do ${formatted}`;
  }
  if (opts.entitled) return "aktivní (bez data konce)";
  return "omezený přístup";
}

export function guestAccess(loginUrl: string, subscribeUrl: string, planLabel = "Host"): AppAccessInfo {
  return {
    authenticated: false,
    accountLabel: "Nepřihlášeni",
    email: null,
    planLabel,
    entitled: false,
    validUntil: null,
    validityLabel: "po přihlášení",
    loginUrl,
    subscribeUrl,
  };
}
