import type { Metadata } from "next";
import Link from "next/link";
import { buildV20PageMetadata } from "@/lib/v20/seo";

export async function generateMetadata(): Promise<Metadata> {
  return buildV20PageMetadata({
    title: "AI asistenti | MedScopeGlobal",
    description: "Veřejný, studentský a klinický AI asistent — tři specializované nástroje.",
    path: "/ai-asistent",
  });
}

const ASSISTANTS = [
  {
    href: "/ai-asistent/verejnost",
    label: "AI pro veřejnost",
    desc: "Prevence, symptomy, životní styl — srozumitelné odpovědi",
    color: "from-emerald-600 to-teal-700",
  },
  {
    href: "/ai-asistent/student",
    label: "AI tutor pro studenty",
    desc: "Anatomie, farmakologie, příprava na zkoušky",
    color: "from-blue-600 to-indigo-700",
  },
  {
    href: "/ai-asistent/lekar",
    label: "Klinický AI pro lékaře",
    desc: "Guidelines, diferenciální diagnostika, studie",
    color: "from-[#021d33] to-[#005B96]",
  },
];

export default function AiAsistentHubPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <h1 className="font-display text-4xl font-bold text-[#021d33]">AI asistenti MedScope</h1>
      <p className="mt-3 text-muted-foreground">
        Tři specializované asistenty napojené na AI Medical engine. Neposkytují diagnózu — slouží ke
        vzdělávání.
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
