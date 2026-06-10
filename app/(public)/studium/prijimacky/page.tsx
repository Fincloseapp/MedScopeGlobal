import Link from "next/link";
import type { Metadata } from "next";
import { CZ_MEDICAL_FACULTIES } from "@/lib/v25/universities-data";

export const metadata: Metadata = {
  title: "Přijímačky na medicínu",
  description: "Přehled přijímaček na české lékařské fakulty — odkazy na oficiální informace.",
};

const TIPS = [
  "Sledujte termíny přihlášek a přijímacích zkoušek na webu každé fakulty.",
  "Připravte se na testy z biologie, chemie a fyziky podle aktuálních sylabů LF.",
  "Ověřte požadavky na zdravotní způsobilost a jazykové předpoklady.",
];

export default function PrijimackyPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <nav className="text-sm text-muted-foreground">
        <Link href="/studium" className="hover:text-foreground">
          Studium
        </Link>
        <span className="mx-2">/</span>
        <span>Přijímačky</span>
      </nav>

      <div className="mt-4 rounded-2xl bg-[#f0f7ff] p-6">
        <h1 className="font-display text-4xl font-bold text-[#021d33]">Přijímačky na medicínu</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Orientační přehled — vždy ověřte aktuální podmínky na oficiálním webu vybrané fakulty.
        </p>
      </div>

      <ul className="mt-8 space-y-3 rounded-2xl border bg-white p-6">
        {TIPS.map((tip) => (
          <li key={tip} className="flex gap-2 text-sm text-slate-700">
            <span className="text-primary">•</span>
            {tip}
          </li>
        ))}
      </ul>

      <h2 className="mt-10 text-xl font-semibold text-[#021d33]">Fakulty — přijímačky</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {CZ_MEDICAL_FACULTIES.map((f) => (
          <div key={f.slug} className="rounded-xl border bg-white p-4">
            <p className="font-medium">{f.shortName}</p>
            <p className="text-sm text-muted-foreground">{f.city}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-sm">
              <Link href={`/studium/univerzity/${f.slug}`} className="text-primary hover:underline">
                Detail fakulty
              </Link>
              <a href={f.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Oficiální web →
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
