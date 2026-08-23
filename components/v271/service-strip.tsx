import Link from "next/link";
import { BookOpen, Building2, CreditCard, FileHeart, FlaskConical, GraduationCap, Mic, Sparkles } from "lucide-react";

const SERVICES = [
  { href: "/medipacient/stahnout", label: "MeDipacient", hint: "stáhnout", Icon: FileHeart },
  { href: "/mediktor", label: "MeDiktor", hint: "pro lékaře", Icon: Mic },
  { href: "/mediktor/ceny", label: "Ceník MeDiktor", hint: "390 Kč", Icon: CreditCard },
  { href: "/mediprep/stahnout", label: "MeDiprep", hint: "stáhnout", Icon: GraduationCap },
  { href: "/academy", label: "Academy", hint: "kurzy", Icon: BookOpen },
  { href: "/ai-medical", label: "AI pomocníci", hint: "7 specializací", Icon: Sparkles },
  { href: "/lekari/research-hub", label: "Výzkum", hint: "studie", Icon: FlaskConical },
  { href: "/predplatne?trial=1", label: "Předplatné", hint: "14 dní", Icon: CreditCard },
  { href: "/firmy", label: "Inzerce", hint: "pro firmy", Icon: Building2 },
] as const;

export function V271ServiceStrip() {
  return (
    <nav
      aria-label="Služby prostředí"
      className="border-b border-slate-200 bg-[#f6f8fb]"
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-stretch gap-1 px-3 py-2 sm:px-6">
        {SERVICES.map(({ href, label, hint, Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex min-w-[6.5rem] flex-1 items-center gap-2 rounded-lg px-2.5 py-2 hover:bg-white ${
              href === "/medipacient/stahnout" ? "bg-[#2D7FF9]/10 text-[#021d33]" : "text-[#021d33]"
            }`}
          >
            <Icon
              className={`h-4 w-4 shrink-0 ${href === "/medipacient/stahnout" ? "text-[#2D7FF9]" : "text-[#005B96]"}`}
              aria-hidden
            />
            <span className="min-w-0">
              <span className="block text-xs font-semibold leading-tight">{label}</span>
              <span className="block text-[10px] text-slate-500">{hint}</span>
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
