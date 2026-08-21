import type { Metadata } from "next";
import Link from "next/link";
import { AppDownloadPanel } from "@/components/apps/app-download-panel";
import { MEDIPREP } from "@/lib/apps/catalog";
import { buildV20PageMetadata } from "@/lib/v20/seo";

export async function generateMetadata(): Promise<Metadata> {
  const base = await buildV20PageMetadata({
    title: `Stáhnout ${MEDIPREP.shortName}`,
    description: MEDIPREP.pitch,
    path: MEDIPREP.downloadPath,
  });
  return {
    ...base,
    manifest: MEDIPREP.manifest,
    appleWebApp: {
      capable: true,
      title: MEDIPREP.shortName,
      statusBarStyle: "black-translucent",
    },
    icons: {
      icon: [
        { url: MEDIPREP.assets.icon192, sizes: "192x192", type: "image/png" },
        { url: MEDIPREP.assets.icon512, sizes: "512x512", type: "image/png" },
      ],
      apple: [{ url: MEDIPREP.assets.appleTouch, sizes: "180x180", type: "image/png" }],
    },
  };
}

export default function MediprepDownloadPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#C45C26]">Instalace MeDiprep</p>
      <h1 className="mt-2 font-display text-3xl font-bold text-[#0A192F]">Ikona MeDiprep na ploše telefonu i PC</h1>
      <p className="mt-3 max-w-2xl text-slate-600">
        App Store a Google Play ještě nejsou. MeDiprep nainstalujete z prohlížeče: ikona se objeví na ploše / v nabídce
        Start jako běžná aplikace. Účet: e-mail + ověřovací kód, bez hesla.
      </p>
      <ol className="mt-6 space-y-2 text-sm text-slate-700">
        <li>
          1. Klepněte na <strong>Stáhnout MeDiprep</strong> — otevře se aplikace a nabídne instalaci na
          plochu.
        </li>
        <li>2. Android Chrome: menu ⋮ → <strong>Nainstalovat aplikaci</strong> / Přidat na plochu.</li>
        <li>3. iPhone Safari: <strong>Sdílet</strong> → <strong>Přidat na plochu</strong>.</li>
        <li>4. PC Chrome/Edge: ikona ⊕ v adresním řádku, nebo menu → Instalovat aplikaci.</li>
      </ol>
      <div className="mt-8">
        <AppDownloadPanel app={MEDIPREP} />
      </div>
      <p className="mt-6 text-sm">
        <Link href={MEDIPREP.marketingPath} className="text-[#C45C26] hover:underline">
          ← Zpět na MeDiprep
        </Link>
      </p>
    </div>
  );
}
