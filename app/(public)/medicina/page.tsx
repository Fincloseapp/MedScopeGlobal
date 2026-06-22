import Link from "next/link";

export default function MedicinaHubPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="rounded-3xl bg-gradient-to-br from-[#005B96] to-[#0A3D5C] px-6 py-8 text-white">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#B9E0FF]">MedScopeGlobal medicína</p>
        <h1 className="mt-4 font-display text-4xl font-bold">Příprava na medicínu a studium medicíny</h1>
        <p className="mt-3 max-w-2xl text-white/80">
          Větev pouze pro medicínu s denními studijními přehledy, připravou na přijímačky a kurzy pro 1.–6. ročník.
        </p>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Link href="/medicina/priprava" className="block rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#005B96]">Příprava LF</p>
          <h2 className="mt-3 font-display text-2xl font-semibold text-medical-navy">Příprava na medicínu</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Studijní cheat-sheety, tematické přehledy, opakování základů a doporučení do přijímaček.
          </p>
        </Link>

        <Link href="/medicina/studium" className="block rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#005B96]">Studium medicíny</p>
          <h2 className="mt-3 font-display text-2xl font-semibold text-medical-navy">1.–6. ročník</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Strukturované přehledy k předmětům, kazuistiky, testovací tipy a výuka v češtině.
          </p>
        </Link>
      </div>

      <div className="mt-10 rounded-2xl border bg-[#f7fbff] p-6">
        <h2 className="font-display text-2xl font-semibold text-medical-navy">Pravidla větve</h2>
        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
          <li>• Pouze medicína, bez odklonu do obecných studentů jiných oborů.</li>
          <li>• Studijní články mají med_track a rok studia pro filtrování.</li>
          <li>• Všechny přehledy jsou pravidelně aktualizovány a deduplikovány.</li>
        </ul>
      </div>
    </div>
  );
}
