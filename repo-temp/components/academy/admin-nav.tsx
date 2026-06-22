import Link from "next/link";

const SECTIONS = [
  { href: "/admin/academy", label: "Dashboard" },
  { href: "/admin/academy/courses", label: "Kurzy" },
  { href: "/admin/academy/lessons", label: "Lekce" },
  { href: "/admin/academy/quizzes", label: "Kvízy" },
  { href: "/admin/academy/ai", label: "AI" },
  { href: "/admin/academy/ai-experts", label: "AI experti" },
  { href: "/admin/academy/ai-logs", label: "AI logy" },
  { href: "/admin/academy/monetization", label: "Monetizace" },
  { href: "/admin/academy/users", label: "Uživatelé" },
  { href: "/admin/academy/marketplace", label: "Marketplace" },
  { href: "/admin/academy/mentoring", label: "Mentoring" },
  { href: "/admin/academy/video", label: "Video" },
  { href: "/admin/academy/video-analytics", label: "Video analytics" },
  { href: "/admin/academy/quality", label: "Kvalita obsahu" },
  { href: "/admin/academy/medical-review", label: "Medicínská kontrola" },
  { href: "/admin/academy/audit", label: "Audit" },
  { href: "/admin/academy/simulations", label: "Simulace" },
  { href: "/admin/academy/textbooks", label: "Učebnice" },
  { href: "/admin/academy/testing", label: "Testování" },
] as const;

export function AcademyAdminNav({ active }: { active?: string }) {
  return (
    <nav className="mt-4 flex flex-wrap gap-2">
      {SECTIONS.map((s) => (
        <Link
          key={s.href}
          href={s.href}
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            active === s.href
              ? "bg-[#005B96] text-white"
              : "border border-[#cfe1f3] text-[#005B96] hover:bg-[#f0f7fc]"
          }`}
        >
          {s.label}
        </Link>
      ))}
    </nav>
  );
}
