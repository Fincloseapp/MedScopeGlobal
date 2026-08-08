import type { Metadata } from "next";
import Link from "next/link";
import { Mic, Sparkles, FileCheck2, Shield } from "lucide-react";
import { DokumentaceWorkspace } from "@/components/lekari/dokumentace-workspace";
import { DokumentaceDownloadPanel } from "@/components/lekari/dokumentace-download-panel";
import { DokumentaceTutorial } from "@/components/lekari/dokumentace-tutorial";
import { V27CheckoutButton } from "@/components/v27/checkout-button";
import { buildV20PageMetadata } from "@/lib/v20/seo";
import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/config/site";
import { DOKSCOPE } from "@/lib/lekari/dokumentace/branding";

export async function generateMetadata(): Promise<Metadata> {
  const base = buildV20PageMetadata({
    title: DOKSCOPE.seoTitle,
    description: DOKSCOPE.seoDescription,
    path: "/lekari/dokumentace",
  });

  return {
    ...base,
    manifest: "/dokumentace-manifest.json",
    appleWebApp: {
      capable: true,
      title: DOKSCOPE.pwaName,
      statusBarStyle: "default",
    },
    other: {
      "mobile-web-app-capable": "yes",
      "apple-mobile-web-app-capable": "yes",
      "apple-mobile-web-app-title": DOKSCOPE.pwaShortName,
      "theme-color": "#005B96",
    },
  };
}

const VALUE_PROPS = [
  {
    icon: Mic,
    title: "Nahrávejte",
    text: "Konzultaci s pacientem nebo diktát — mikrofonem či nahráním audia.",
  },
  {
    icon: Sparkles,
    title: "AI zpracuje",
    text: "Návrh strukturovaného zápisu pro českou ordinaci — detaily šablon až v aplikaci.",
  },
  {
    icon: FileCheck2,
    title: "Hotovo ke kontrole",
    text: "Upravitelný zápis ke kopírování. Lékař vždy schvaluje finální znění.",
  },
  {
    icon: Shield,
    title: "GDPR ephemeral",
    text: "Audio se po zpracování neukládá. Souhlas pacienta před nahráváním.",
  },
] as const;

export default function LekariDokumentacePage() {
  return (
    <div className="bg-[#fafcff]">
      <section className="relative overflow-hidden border-b border-[#d9e8f4]">
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(0,91,150,0.18),transparent_50%),radial-gradient(ellipse_at_90%_20%,rgba(2,29,51,0.12),transparent_45%),linear-gradient(165deg,#021d33_0%,#005B96_55%,#0a7ab8_100%)]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-sky-200">
            Pro lékaře
          </p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
            {DOKSCOPE.shortName}
          </h1>
          <p className="mt-2 text-sm font-medium text-sky-200/90">{DOKSCOPE.lockline}</p>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-sky-100/95">
            {DOKSCOPE.fullName} — AI zapisovatel pro ordinaci. Nahrávka nebo diktát, strukturovaný klinický zápis. Samostatně 390 Kč/měsíc včetně balíčku Lékař v praxi.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="h-12 rounded-full bg-white px-6 text-[#021d33] hover:bg-sky-50">
              <a href="#stahnout">Stáhnout přes QR</a>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 rounded-full border-white/40 bg-transparent px-6 text-white hover:bg-white/10">
              <a href="#ukazka">Jak to funguje</a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 rounded-full border-white/40 bg-transparent px-6 text-white hover:bg-white/10"
            >
              <Link href="/predplatne#dokumentace">390 Kč / měsíc</Link>
            </Button>
          </div>
          <p className="mt-4 text-xs text-sky-100/80">
            {`Stažení jen pro ověřené lékaře — účet MedScopeGlobal · ${DOKSCOPE.domain}`}
          </p>
        </div>
      </section>

      <section id="ukazka" className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <DokumentaceTutorial variant="full" />
      </section>

      <section id="stahnout" className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <DokumentaceDownloadPanel variant="marketing" />
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="rounded-2xl border border-[#005B96]/25 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#005B96]">
            Nejvýhodnější vstup pro ordinaci
          </p>
          <h2 className="mt-2 font-display text-2xl font-bold text-[#021d33]">
            DokScope standalone — 390 Kč/měsíc
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Levnější než Lékař v praxi (490 Kč), se stejnými právy lékaře: guidelines,
            CME, klinický AI i historie zápisů (sync mobil ↔ web). Ročně 3900 Kč · 14 dní
            zdarma.
          </p>
          <ul className="mt-4 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
            <li>✓ AI zápisy z nahrávky / diktátu</li>
            <li>✓ Šablony ambulantní, SOAP, anamnéza…</li>
            <li>✓ Celý balíček Lékař v praxi v ceně</li>
            <li>✓ Historie v účtu — mobil i PC</li>
          </ul>
          <div className="mt-6 max-w-md space-y-2">
            <V27CheckoutButton
              kind="subscription"
              productId="dokumentace-month"
              label="Začít 14 dní zdarma — 390 Kč"
            />
            <p className="text-center text-xs text-slate-500">
              Nebo{" "}
              <Link href="/predplatne#physician" className="text-[#005B96] underline">
                Lékař v praxi za 490 Kč
              </Link>{" "}
              — DokScope je levnější vstup se stejnými právy.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <h2 className="font-display text-2xl font-bold text-[#021d33]">
          Nahrávejte · AI zpracuje · Hotovo
        </h2>
        <p className="mt-2 max-w-2xl text-slate-600">
          Konzultace i diktát, šablony pro praxi a ephemeral audio — inspirováno
          moderními AI scribe nástroji, přizpůsobeno české dokumentaci.
        </p>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {VALUE_PROPS.map(({ icon: Icon, title, text }) => (
            <div key={title} className="border-l-2 border-[#005B96] pl-4">
              <Icon className="h-5 w-5 text-[#005B96]" />
              <h3 className="mt-3 font-display text-lg font-semibold text-[#021d33]">
                {title}
              </h3>
              <p className="mt-1 text-sm leading-6 text-slate-600">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-[#d9e8f4] bg-[#eef6fb]">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-sm leading-6 text-[#021d33]">
            <span className="font-semibold">390 Kč/měsíc</span> včetně celého balíčku
            Lékař · 14 dní trial · demo 3 zápisy/den po přihlášení
          </p>
          <Button asChild className="rounded-full bg-[#005B96] shrink-0">
            <Link href="/predplatne#dokumentace">Zobrazit předplatné</Link>
          </Button>
        </div>
      </section>

      <section id="workspace" className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <h2 className="mb-6 font-display text-2xl font-bold text-[#021d33]">
          Pracovní prostor
        </h2>
        <DokumentaceWorkspace />
      </section>

      <section className="border-t border-[#d9e8f4] bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <h2 className="font-display text-xl font-bold text-[#021d33]">
            Právní rámec
          </h2>
          <ul className="mt-4 max-w-3xl list-disc space-y-2 pl-5 text-sm leading-6 text-slate-600">
            <li>
              DokScope od MedScopeGlobal je asistent pro lékaře — není zdravotnický
              prostředek ani diagnóza.
            </li>
            <li>
              Lékař odpovídá za kontrolu a schválení zápisu před uložením do
              zdravotnické dokumentace.
            </li>
            <li>
              Před nahráváním rozhovoru informujte pacienta (nebo použijte režim
              diktátu bez pacienta).
            </li>
            <li>
              Audio se po zpracování neukládá na disk ani do databáze (ephemeral
              zpracování). Textápisy se ukládají do vašeho účtu na {SITE.name}.
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
