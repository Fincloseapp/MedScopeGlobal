import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Studium medicíny — přehled",
  description: "Přijímačky, lékařské fakulty a studijní obsah MedScopeGlobal.",
};

const LINKS = [
  { href: "/studium/univerzity", title: "Lékařské fakulty", desc: "8 českých LF — přehled a odkazy" },
  { href: "/studium/fakulty", title: "Fakulty", desc: "Katalog fakult a měst" },
  { href: "/studium/prijimacky", title: "Přijímačky", desc: "Termíny, požadavky a tipy" },
  { href: "/medicina/studium", title: "Studijní obsah", desc: "Články podle ročníku a oboru" },
];

export default function StudiumHubPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <nav className="text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Domů
        </Link>
        <span className="mx-2">/</span>
        <span>Studium</span>
      </nav>

      <div className="mt-4 rounded-2xl bg-[#f0f7ff] p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Studium medicíny</p>
        <h1 className="mt-2 font-display text-4xl font-bold text-[#021d33]">Studium</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Přehled lékařských fakult v ČR, přijímačky a studijní materiály na MedScopeGlobal.
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {LINKS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-2xl border bg-white p-6 transition hover:border-primary/40 hover:shadow-sm"
          >
            <h2 className="text-lg font-semibold text-[#021d33]">{item.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
