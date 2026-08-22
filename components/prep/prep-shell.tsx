import Link from "next/link";
import { prepBankStats } from "@/lib/prep/questions";
import { MEDIPREP } from "@/lib/prep/branding";

const LINKS = [
  { href: "/prep/dashboard", label: "Plán a skóre" },
  { href: "/prep/test", label: "Testy" },
  { href: "/prep/uceni", label: "Učení" },
  { href: "/prep/drill", label: "Drill" },
  { href: "/prep/hry", label: "Hry" },
] as const;

export function PrepShell({
  children,
  active,
}: {
  children: React.ReactNode;
  active?: string;
}) {
  const stats = prepBankStats();
  return (
    <div className="min-h-full bg-[#F3EDE1] text-[#1A2332]">
      <div className="border-b border-[#e0d5c4] bg-[#F8F4EA]/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link href="/mediprep" className="flex items-baseline gap-2">
            <span className="font-display text-lg font-semibold tracking-tight text-[#1A2332]">
              {MEDIPREP.shortName}
            </span>
            <span className="hidden text-xs text-[#6b6256] sm:inline">{MEDIPREP.lockline}</span>
          </Link>
          <nav className="flex flex-wrap gap-1" aria-label={MEDIPREP.shortName}>
            {LINKS.map((l) => {
              const on = active === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`rounded-full px-3 py-1.5 text-sm ${
                    on
                      ? "bg-[#1A2332] text-[#F8F4EA]"
                      : "text-[#3d4a5c] hover:bg-[#e8dfd0]"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>
          <p className="hidden text-[11px] text-[#6b6256] lg:block">{stats.total} originálních otázek</p>
        </div>
      </div>
      <div className="border-b border-white/10 bg-[#0A192F] px-4 py-2 text-center text-sm text-white">
        Testy, učení i hry běží v aplikaci {MEDIPREP.shortName} — stáhněte ji na plochu telefonu i PC.{" "}
        <Link href={`${MEDIPREP.routes.app}?install=1`} className="font-semibold underline underline-offset-2">
          Otevřít aplikaci
        </Link>
        {" · "}
        <Link href={MEDIPREP.routes.download} className="underline underline-offset-2">
          Návod ke stažení
        </Link>
      </div>
      {children}
    </div>
  );
}
