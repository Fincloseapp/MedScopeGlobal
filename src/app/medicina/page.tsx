import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";

export const metadata: Metadata = {
  title: "Medicína",
  description: "Příprava na studium medicíny a materiály pro studenty lékařských fakult.",
  alternates: { canonical: "/medicina" }
};

export default function MedicinaPage() {
  return (
    <main className="section">
      <Breadcrumbs items={[{ label: "Domů", href: "/" }, { label: "Medicína" }]} />
      <p className="eyebrow">Student medicíny</p>
      <h1>Medicína — příprava a studium</h1>
      <p className="lead">
        Samostatná větev magazínu pro budoucí i současné studenty medicíny. Obsah je kurátorovaný tak,
        aby doplňoval fakultní studium, ne ho nahrazoval.
      </p>
      <div className="grid two">
        <article className="card">
          <h2>Příprava na medicínu</h2>
          <p>
            Přijímačky, time management, doporučená literatura a srozumitelné články z oblasti
            biomedicíny pro středoškoláky.
          </p>
          <Link className="button primary" href="/medicina/priprava">
            Vstoupit do přípravy
          </Link>
        </article>
        <article className="card">
          <h2>Studium medicíny</h2>
          <p>
            Přehledy oborů, klinické dovednosti, etika a výzkum pro studenty prvních až posledních
            ročníků.
          </p>
          <Link className="button primary" href="/medicina/studium">
            Materiály pro studium
          </Link>
        </article>
      </div>
      <p className="article-section">
        <strong>Upozornění:</strong> Informace na webu nenahrazují lékařskou péči ani oficiální
        studijní plány fakult.
      </p>
    </main>
  );
}
