import type { Metadata } from "next";
import Link from "next/link";
import { getLegalEntity } from "@/lib/config/legal-entity";

export const metadata: Metadata = {
  title: "Právní checklist",
  robots: { index: false, follow: false },
};

export default function AdminPravniChecklistPage() {
  const entity = getLegalEntity();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#005B96]">Interní</p>
        <h1 className="mt-1 font-display text-2xl font-semibold text-[#021d33]">Právní checklist</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Provozní brief pro IP a imprint. Veřejný web drží jen to, co zákon vyžaduje (podmínky,
          soukromí, cookies, kontakt + IČO). Sídlo sem patří — čtenář ho na webu nevidí hned.
        </p>
      </div>

      <section className="rounded-2xl border border-[#d9e8f4] bg-white p-5">
        <h2 className="font-display text-lg font-semibold">1. Hotovo na medscopeglobal.com</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-700">
          <li>
            Identita provozovatele: {entity.name}, IČO {entity.ico}
          </li>
          <li>Sídlo (jen admin + faktura + ARES): {entity.address}</li>
          <li>
            Podpora: {entity.supportEmail}
            {entity.supportPhone ? `, ${entity.supportPhone}` : ""}
          </li>
          <li>
            Distancing značky:{" "}
            <Link href="/znacka" className="text-[#005B96] underline">
              /znacka
            </Link>
          </li>
          <li>
            GDPR / podmínky:{" "}
            <Link href="/privacy" className="text-[#005B96] underline">
              /privacy
            </Link>
            ,{" "}
            <Link href="/terms" className="text-[#005B96] underline">
              /terms
            </Link>
          </li>
          <li>Faktury: správná firma + režim neplátce DPH</li>
        </ul>
      </section>

      <section className="rounded-2xl border border-[#d9e8f4] bg-white p-5">
        <h2 className="font-display text-lg font-semibold">2. Brief pro IP advokáta (P0)</h2>
        <p className="mt-2 text-sm text-slate-600">Objednejte rešerši a přihlášku s těmito údaji:</p>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-700">
          <li>
            <strong>Přihlašovatel:</strong> {entity.name}, IČO {entity.ico}
            {entity.courtFile ? `, sp. zn. ${entity.courtFile}` : ""}
          </li>
          <li>
            <strong>Sídlo:</strong> {entity.address}
          </li>
          <li>
            <strong>Označení:</strong> slovní MedScopeGlobal (+ případně logo)
          </li>
          <li>
            <strong>Doména / užívání:</strong> https://{entity.domain}
          </li>
          <li>
            <strong>Úřady:</strong> ÚPV ČR (národní) + EUIPO (EUTM)
          </li>
          <li>
            <strong>Třídy Nice:</strong> 9, 35, 38, 41, 42; třída 44 jen po konzultaci
          </li>
          <li>
            <strong>Riziko:</strong> podobnost s Medscape / WebMD a dalšími MedScope označeními
          </li>
          <li>
            <strong>Watch:</strong> monitoring nových přihlášek a podobných domén
          </li>
        </ul>
      </section>

      <section className="rounded-2xl border border-[#d9e8f4] bg-white p-5">
        <h2 className="font-display text-lg font-semibold">3. Provozní kroky (P1)</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-700">
          <li>Registrar lock + 2FA u domény medscopeglobal.com</li>
          <li>V marketingu vždy plný wordmark MedScopeGlobal</li>
          <li>Evidence prvního užívání (screenshoty, faktury, tisk)</li>
          <li>Smlouvy s autory/partnery: licence IP + NDA</li>
        </ul>
      </section>

      <section className="rounded-2xl border border-[#d9e8f4] bg-white p-5">
        <h2 className="font-display text-lg font-semibold">4. Co web nemůže zajistit</h2>
        <p className="mt-2 text-sm text-slate-700">
          Doména a právní texty nesuplují zápis ochranné známky a negarantují, že Medscape/WebMD
          nepodají námitku. Cíl je silný titul a dobrá důkazní pozice.
        </p>
        <p className="mt-3 text-sm text-slate-700">
          Kontakt: <a href={"mailto:" + entity.legalEmail}>{entity.legalEmail}</a>
        </p>
      </section>
    </div>
  );
}
