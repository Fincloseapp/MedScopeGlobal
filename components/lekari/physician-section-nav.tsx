import Link from "next/link";
import { localizePublicHref, translateNavHref } from "@/lib/i18n/nav-copy";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { isCzechSurface } from "@/lib/i18n/surface-copy";

const ROOMS = [
  { href: "/lekari", fallback: "Desk" },
  { href: "/lekari/guidelines", fallback: "Guidelines" },
  { href: "/lekari/studie", fallback: "Studie" },
  { href: "/lekari/research-hub", fallback: "Research Hub" },
  { href: "/lekari/ai-asistent", fallback: "AI asistent" },
  { href: "/lekari/dokumentace", fallback: "OrdiZapis" },
] as const;

export async function PhysicianSectionNav({ current }: { current?: string }) {
  const locale = await getServerLocale();
  const czech = isCzechSurface(locale);
  const items = czech
    ? [...ROOMS, { href: "/lekari/prehledy", fallback: "Přehledy" } as const]
    : ROOMS;

  return (
    <nav aria-label="Physician desk" className="flex flex-wrap gap-2">
      {items.map((item) => {
        const active = current === item.href;
        const translated = translateNavHref(item.href, locale, { label: item.fallback });
        return (
          <Link
            key={item.href}
            href={localizePublicHref(item.href, locale)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              active
                ? "bg-[#021d33] text-white"
                : "border border-[#cfe1f3] bg-white text-[#021d33] hover:border-[#005B96]/40"
            }`}
          >
            {translated.label}
          </Link>
        );
      })}
    </nav>
  );
}
