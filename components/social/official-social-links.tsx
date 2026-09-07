import { getShareCopy } from "@/lib/i18n/share-copy";
import { officialSocialProfiles } from "@/lib/social/profiles";

const LABELS: Record<string, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  youtube: "YouTube",
  linkedin: "LinkedIn",
  whatsapp: "WhatsApp",
};

export function OfficialSocialLinks({ locale = "cs" }: { locale?: string }) {
  const profiles = officialSocialProfiles();
  if (profiles.length === 0) return null;
  const copy = getShareCopy(locale);
  return (
    <nav className="mt-4" aria-label={copy.profilesTitle}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#005B96]/90">
        {copy.profilesTitle}
      </p>
      <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted-foreground">
        {profiles.map((row) => (
          <li key={row.network}>
            <a href={row.href} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
              {LABELS[row.network] ?? row.network}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
