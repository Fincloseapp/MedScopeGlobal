import type { Metadata } from "next";
import Link from "next/link";
import { buildV20PageMetadata } from "@/lib/v20/seo";
import { MEDIPREP } from "@/lib/prep/branding";
import { MeDiprepPwaRegister } from "@/components/prep/mediprep-install-button";
import { MeDiprepLogo } from "@/components/prep/mediprep-mark";

export async function generateMetadata(): Promise<Metadata> {
  const base = buildV20PageMetadata({
    title: `Návod ${MEDIPREP.shortName}`,
    description: "Jak stáhnout MeDiprep, přihlásit se e-mailem a spustit první simulaci přijímaček LF.",
    path: "/mediprep/navod",
  });
  return {
    ...base,
    openGraph: {
      ...base.openGraph,
      images: [{ url: MEDIPREP.assets.social, alt: MEDIPREP.socialLine }],
    },
    twitter: {
      ...base.twitter,
      card: "summary_large_image",
      images: [MEDIPREP.assets.social],
    },
  };
}

export default function MeDiprepGuidePage() {
  return (
    <div className="bg-[#F4F7FB]">
      <MeDiprepPwaRegister />
      <div className="mx-auto max-w-2xl space-y-6 px-4 py-12 sm:px-6">
        <div className="space-y-3">
          <MeDiprepLogo />
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#F97316]">{MEDIPREP.lockline}</p>
            <h1 className="font-display text-3xl font-semibold text-[#0A192F]">Jak začít s MeDiprep</h1>
            <p className="mt-1 text-sm text-slate-600">{MEDIPREP.partnerLine}</p>
          </div>
        </div>
        <ol className="list-decimal space-y-4 pl-5 text-sm leading-relaxed text-[#3d4a5c]">
          <li>
            Otevřete{" "}
            <Link href={`${MEDIPREP.routes.app}?install=1`} className="text-[#005B96] underline">
              aplikaci MeDiprep
            </Link>{" "}
            v Safari (iPhone) nebo Chrome (Android / PC).
          </li>
          <li>
            Klepněte na <strong>Nainstalovat MeDiprep na plochu</strong>. Na iPhonu: Sdílet → Přidat na plochu.
          </li>
          <li>Spusťte MeDiprep z ikony. Zadejte e-mail — přijde 6místný kód. Heslo nepotřebujete.</li>
          <li>Vyberte fakultu. Simulace nastaví bloky B/C/F a čas.</li>
          <li>Učení po kapitolách, drill mezer, pexeso. Testy, učení i hry zůstanou v aplikaci.</li>
        </ol>
        <p className="text-xs text-[#6b6256]">
          MeDiprep není lékařská fakulta a otázky nejsou oficiální přijímačky. Podpora {MEDIPREP.supportPhone}.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href={`${MEDIPREP.routes.app}?install=1`}
            className="inline-flex rounded-full bg-[#F97316] px-5 py-2.5 text-sm font-semibold text-white"
          >
            Otevřít aplikaci
          </Link>
          <Link
            href={MEDIPREP.routes.download}
            className="inline-flex rounded-full border border-[#1A2332]/20 bg-white px-5 py-2.5 text-sm font-medium"
          >
            Návod ke stažení
          </Link>
        </div>
      </div>
    </div>
  );
}
