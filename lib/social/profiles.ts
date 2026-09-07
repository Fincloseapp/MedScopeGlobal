/** Official profile URLs. Empty until NEXT_PUBLIC_SOCIAL_* is set — never invent handles. */

export type OfficialSocialNetwork =
  | "instagram"
  | "facebook"
  | "youtube"
  | "linkedin"
  | "whatsapp";

export type OfficialSocialProfile = {
  network: OfficialSocialNetwork;
  href: string;
};

function envUrl(name: string): string | null {
  const raw = process.env[name]?.trim();
  if (!raw) return null;
  if (!/^https?:\/\//i.test(raw)) return null;
  return raw;
}

export function officialSocialProfiles(): OfficialSocialProfile[] {
  const rows: OfficialSocialProfile[] = [];
  const instagram = envUrl("NEXT_PUBLIC_SOCIAL_INSTAGRAM");
  const facebook = envUrl("NEXT_PUBLIC_SOCIAL_FACEBOOK");
  const youtube = envUrl("NEXT_PUBLIC_SOCIAL_YOUTUBE");
  const linkedin = envUrl("NEXT_PUBLIC_SOCIAL_LINKEDIN");
  const whatsapp = envUrl("NEXT_PUBLIC_SOCIAL_WHATSAPP");
  if (instagram) rows.push({ network: "instagram", href: instagram });
  if (facebook) rows.push({ network: "facebook", href: facebook });
  if (youtube) rows.push({ network: "youtube", href: youtube });
  if (linkedin) rows.push({ network: "linkedin", href: linkedin });
  if (whatsapp) rows.push({ network: "whatsapp", href: whatsapp });
  return rows;
}

export function officialProfile(network: OfficialSocialNetwork): string | null {
  return officialSocialProfiles().find((row) => row.network === network)?.href ?? null;
}
