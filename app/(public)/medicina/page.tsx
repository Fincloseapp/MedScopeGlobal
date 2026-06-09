import Link from "next/link";
import Image from "next/image";
import { V21_STUDIUM_TOPICS } from "@/lib/v21/curated/medicina";

export const revalidate = 120;

export default function MedicinaHubPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="rounded-3xl bg-gradient-to-br from-[#005B96] to-[#0A3D5C] px-6 py-8 text-white">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#B9E0FF]">Studium medicíny</p>
        <h1 className="mt-4 font-display text-4xl font-bold">Příprava na medicínu a studium na LF</h1>
        <p className="mt-3 max-w-2xl text-white/85">
          Komplexní přehled pro uchazeče o studium i studenty 1.–6. ročníku — anatomie, fyziologie,
          patologie, klinické obory, zkoušky a přijímačky.
        </p>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {V21_STUDIUM_TOPICS.map((topic) => (
          <Link
            key={topic.slug}
            href={topic.href}
            className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="relative aspect-[16/10] bg-slate-100">
              <Image src={topic.imageUrl} alt="" fill className="object-cover" sizes="33vw" />
            </div>
            <div className="p-5">
              <h2 className="font-display text-xl font-semibold text-[#021d33] group-hover:text-primary">
                {topic.title}
              </h2>
              <p className="mt-2 text-sm text-slate-600">{topic.description}</p>
              <ul className="mt-3 space-y-1 text-xs text-slate-500">
                {topic.tips.map((t) => (
                  <li key={t}>• {t}</li>
                ))}
              </ul>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-10 rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/5 to-white p-6">
        <h2 className="font-display text-2xl font-semibold text-[#021d33]">Kvízy a studijní hry</h2>
        <p className="mt-2 text-sm text-slate-600">
          Procvičte anatomii, fyziologii, patologii a přípravu na přijímačky v interaktivních kvízech.
        </p>
        <Link href="/medicina/hry" className="mt-4 inline-flex rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground">
          Spustit kvízy →
        </Link>
      </div>

      <div className="mt-6 rounded-2xl border bg-[#f7fbff] p-6">
        <h2 className="font-display text-2xl font-semibold text-[#021d33]">Důležité upozornění</h2>
        <p className="mt-3 text-sm text-slate-600">
          MedScopeGlobal není oficiální učebnice LF ani přijímací komise. Obsah slouží ke studijní
          podpoře a inspiraci — vždy ověřte informace u své fakulty.
        </p>
      </div>
    </div>
  );
}
