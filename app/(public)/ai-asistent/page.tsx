import type { Metadata } from "next";
import Link from "next/link";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "AI asistenti | MedScopeGlobal",
  description: "Veřejný zdravotní asistent, studentský tutor a klinický asistent pro lékaře — tři specializované nástroje.",
  path: "/ai-asistent",
});

const ASSISTANTS = [
  {
    href: "/ai-asistent/verejnost",
    label: "Public Health Assistant",
    desc: "Prevence, symptomy, životní styl — srozumitelné odpovědi pro veřejnost",
    color: "from-emerald-600 to-teal-700",
  },
  {
    href: "/ai-asistent/student",
    label: "Student Medical Tutor",
    desc: "Anatomie, farmakologie, příprava na zkoušky a LF",
    color: "from-blue-600 to-indigo-700",
  },
  {
    href: "/ai-asistent/lekar",
    label: "Clinical Assistant for Doctors",
    desc: "Guidelines, diferenciální diagnostika a klinické studie",
    color: "from-[#021d33] to-[#005B96]",
  },
];

export default function AiAsistentHubPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <h1 className="font-display text-4xl font-bold text-[#021d33]">AI asistenti MedScope</h1>
      <p className="mt-3 text-muted-foreground">
        Tři specializované asistenty pro veřejnost, studenty medicíny a lékaře. Neposkytují diagnózu —
        slouží ke vzdělávání.
      </p>
      <div className="mt-10 grid gap-4">
        {ASSISTANTS.map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className={`block rounded-2xl bg-gradient-to-r ${a.color} p-6 text-white transition hover:opacity-95`}
          >
            <p className="font-display text-xl font-semibold">{a.label}</p>
            <p className="mt-1 text-sm text-white/85">{a.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
