"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { SalesSnapshot } from "@/lib/sales/types";
import { formatSalesCzk } from "@/lib/sales/packages";

type Tab = "prehled" | "pipeline" | "inzerenti" | "outreach" | "faktury" | "poptavky" | "pravni";

const TABS: { id: Tab; label: string }[] = [
  { id: "prehled", label: "Přehled" },
  { id: "pipeline", label: "Pipeline" },
  { id: "inzerenti", label: "Inzerenti" },
  { id: "outreach", label: "Oslovení" },
  { id: "faktury", label: "Faktury" },
  { id: "poptavky", label: "Poptávky" },
  { id: "pravni", label: "Právní" },
];

function statusCs(value: string): string {
  const map: Record<string, string> = {
    identified: "nalezeno",
    qualified: "kvalifikováno",
    outreach_queued: "fronta e-mailu",
    contacted: "osloveno",
    engaged: "odpověď",
    offered: "nabídka",
    negotiating: "jednání",
    contract_sent: "smlouva",
    won: "uzavřeno",
    fulfilling: "plnění",
    renewing: "obnova",
    past_due: "po splatnosti",
    paused: "pozastaveno",
    lost: "ztráta",
    suppressed: "odhlášeno",
    pending_payment: "čeká na platbu",
    active: "aktivní",
    issued: "vystaveno",
    sent: "odesláno",
    paid: "zaplaceno",
    overdue: "po splatnosti",
    queued: "ve frontě",
    needs_approval: "ke schválení",
    approved: "schváleno",
    forwarded: "předáno",
    held_unpaid: "drží se (neplaceno)",
    received: "přijato",
  };
  return map[value] ?? value;
}

export function SalesDesk() {
  const [data, setData] = useState<SalesSnapshot | null>(null);
  const [tab, setTab] = useState<Tab>("prehled");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");

  const load = useCallback(async () => {
    setError(null);
    const res = await fetch("/api/admin/sales", { credentials: "same-origin" });
    if (!res.ok) {
      setError("Nepodařilo se načíst obchodní oddělení.");
      return;
    }
    setData((await res.json()) as SalesSnapshot);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function act(action: string, extra?: Record<string, string>) {
    setBusy(action + (extra?.id ?? ""));
    await fetch("/api/admin/sales/action", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...extra }),
    });
    await load();
    setBusy(null);
  }

  const kpis = data?.kpis;
  const generated = useMemo(() => {
    if (!data?.generatedAt) return "";
    return new Date(data.generatedAt).toLocaleString("cs-CZ");
  }, [data?.generatedAt]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#005B96]">Admin · Peníze</p>
          <h1 className="mt-1 font-display text-3xl font-bold text-[#021d33]">Obchodní oddělení</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-600">
            Autonomní prodej paušální inzerce: vyhledání firem, právně čisté oslovení, nabídka, faktura,
            Stripe, plnění ploch a předání poptávek. Studený e-mail jde ke schválení, inbound se posílá sám.
          </p>
          {generated ? <p className="mt-1 text-xs text-slate-500">Stav k {generated}</p> : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button disabled={busy !== null} onClick={() => void act("run_tick")}>
            {busy === "run_tick" ? "Běží…" : "Spustit autonomní běh"}
          </Button>
          <Button variant="outline" asChild>
            <Link href="/inzerce/pausal">Veřejný paušál</Link>
          </Button>
        </div>
      </div>

      {error ? <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{error}</p> : null}
      {data && !data.db ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Databáze zatím není připojená (chybí service role). Dashboard ukazuje ceník a právní pravidla.
          Po migraci <code>20260913220000_sales_department.sql</code> se naplní pipeline.
        </p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Aktivní inzerenti", value: kpis?.activeAdvertisers ?? 0 },
          { label: "MRR paušálů", value: formatSalesCzk(kpis?.mrrCzk ?? 0) },
          { label: "Zaplaceno tento měsíc", value: formatSalesCzk(kpis?.paidThisMonthCzk ?? 0) },
          { label: "Poptávky / předáno", value: `${kpis?.inquiriesThisMonth ?? 0} / ${kpis?.forwardedThisMonth ?? 0}` },
        ].map((card) => (
          <div key={card.label} className="rounded-2xl border border-[#d9e8f4] bg-white p-4">
            <p className="text-xs uppercase tracking-wider text-slate-500">{card.label}</p>
            <p className="mt-1 font-display text-2xl font-semibold text-[#021d33]">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`rounded-full px-3 py-1.5 text-sm ${
              tab === item.id ? "bg-[#005B96] text-white" : "border border-slate-200 bg-white text-slate-700"
            }`}
          >
            {item.label}
            {item.id === "outreach" && kpis?.outreachNeedsApproval ? ` (${kpis.outreachNeedsApproval})` : ""}
          </button>
        ))}
      </div>

      {tab === "prehled" && data ? (
        <section className="space-y-4">
          <div className="overflow-x-auto rounded-2xl border bg-white">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-3 py-2">Stav pipeline</th>
                  <th className="px-3 py-2">Počet</th>
                </tr>
              </thead>
              <tbody>
                {data.byStage
                  .filter((row) => row.count > 0)
                  .map((row) => (
                    <tr key={row.stage} className="border-t">
                      <td className="px-3 py-2">{statusCs(row.stage)}</td>
                      <td className="px-3 py-2">{row.count}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {data.packages.map((pkg) => (
              <div key={pkg.id} className="rounded-2xl border border-[#d9e8f4] bg-white p-4">
                <p className="font-semibold text-[#021d33]">
                  {pkg.name} · {formatSalesCzk(pkg.priceCzkMonth)} / měsíc
                </p>
                <p className="mt-1 text-sm text-slate-600">{pkg.tagline}</p>
              </div>
            ))}
          </div>
          {data.runs[0] ? (
            <p className="text-xs text-slate-500">
              Poslední běh: {data.runs[0].ok ? "OK" : "chyba"} · {JSON.stringify(data.runs[0].summary)}
            </p>
          ) : null}
        </section>
      ) : null}

      {tab === "pipeline" && data ? (
        <section className="space-y-4">
          <form
            className="flex flex-wrap gap-2 rounded-2xl border bg-white p-4"
            onSubmit={(e) => {
              e.preventDefault();
              void act("add_prospect", { company, email });
              setCompany("");
              setEmail("");
            }}
          >
            <input
              className="rounded-lg border px-3 py-2 text-sm"
              placeholder="Firma"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
            <input
              className="rounded-lg border px-3 py-2 text-sm"
              placeholder="Role e-mail (info@…)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button type="submit" size="sm" disabled={busy !== null}>
              Přidat inbound kontakt
            </Button>
          </form>
          <div className="overflow-x-auto rounded-2xl border bg-white">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-3 py-2">Firma</th>
                  <th className="px-3 py-2">Stav</th>
                  <th className="px-3 py-2">Právní základ</th>
                  <th className="px-3 py-2">Kontakt</th>
                </tr>
              </thead>
              <tbody>
                {data.prospects.map((row) => (
                  <tr key={row.id} className="border-t align-top">
                    <td className="px-3 py-2">
                      <p className="font-medium">{row.company}</p>
                      <p className="text-xs text-slate-500">{row.sector} · {row.source}</p>
                    </td>
                    <td className="px-3 py-2">{statusCs(row.stage)}</td>
                    <td className="px-3 py-2">{row.legal_basis}</td>
                    <td className="px-3 py-2 text-xs">{row.email ?? "čeká na ověřený e-mail"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {tab === "inzerenti" && data ? (
        <div className="overflow-x-auto rounded-2xl border bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-3 py-2">Inzerent</th>
                <th className="px-3 py-2">Paušál</th>
                <th className="px-3 py-2">Zaplaceno</th>
                <th className="px-3 py-2">Poptávky</th>
                <th className="px-3 py-2">Akce</th>
              </tr>
            </thead>
            <tbody>
              {data.contracts.map((row) => (
                <tr key={row.id} className="border-t align-top">
                  <td className="px-3 py-2">
                    <p className="font-medium">{row.company}</p>
                    <p className="text-xs text-slate-500">{statusCs(row.status)} · {row.email}</p>
                  </td>
                  <td className="px-3 py-2">
                    {row.package_id} · {formatSalesCzk(row.monthly_czk)}
                  </td>
                  <td className="px-3 py-2">
                    {row.paid_months} měs. · {formatSalesCzk(row.paid_total_czk)}
                  </td>
                  <td className="px-3 py-2">{row.inquiryCount}</td>
                  <td className="px-3 py-2">
                    <div className="flex flex-col gap-1">
                      {row.status === "active" ? (
                        <Button size="sm" variant="outline" disabled={busy !== null} onClick={() => void act("pause_contract", { id: row.id })}>
                          Pozastavit
                        </Button>
                      ) : (
                        <Button size="sm" disabled={busy !== null} onClick={() => void act("resume_contract", { id: row.id })}>
                          Obnovit
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {tab === "outreach" && data ? (
        <div className="overflow-x-auto rounded-2xl border bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-3 py-2">Firma</th>
                <th className="px-3 py-2">Stav</th>
                <th className="px-3 py-2">Předmět</th>
                <th className="px-3 py-2">Akce</th>
              </tr>
            </thead>
            <tbody>
              {data.outreach.map((row) => (
                <tr key={row.id} className="border-t align-top">
                  <td className="px-3 py-2">
                    <p className="font-medium">{row.company}</p>
                    <p className="text-xs text-slate-500">{row.email}</p>
                  </td>
                  <td className="px-3 py-2">{statusCs(row.status)}</td>
                  <td className="px-3 py-2 text-xs">{row.subject}</td>
                  <td className="px-3 py-2">
                    {row.status === "needs_approval" ? (
                      <div className="flex flex-col gap-1">
                        <Button size="sm" disabled={busy !== null} onClick={() => void act("approve_outreach", { id: row.id })}>
                          Schválit odeslání
                        </Button>
                        <Button size="sm" variant="outline" disabled={busy !== null} onClick={() => void act("reject_outreach", { id: row.id })}>
                          Zamítnout
                        </Button>
                      </div>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {tab === "faktury" && data ? (
        <div className="overflow-x-auto rounded-2xl border bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-3 py-2">Faktura</th>
                <th className="px-3 py-2">Firma</th>
                <th className="px-3 py-2">Částka</th>
                <th className="px-3 py-2">Stav</th>
                <th className="px-3 py-2">Akce</th>
              </tr>
            </thead>
            <tbody>
              {data.invoices.map((row) => (
                <tr key={row.id} className="border-t">
                  <td className="px-3 py-2">
                    {row.number}
                    <p className="text-xs">VS {row.variable_symbol}</p>
                  </td>
                  <td className="px-3 py-2">{row.company}</td>
                  <td className="px-3 py-2">{formatSalesCzk(row.amount_czk)}</td>
                  <td className="px-3 py-2">{statusCs(row.status)}</td>
                  <td className="px-3 py-2">
                    <div className="flex flex-col gap-1">
                      <Button size="sm" variant="outline" disabled={busy !== null} onClick={() => void act("send_invoice", { id: row.id })}>
                        Odeslat
                      </Button>
                      {row.status !== "paid" ? (
                        <Button size="sm" disabled={busy !== null} onClick={() => void act("mark_paid", { id: row.id })}>
                          Převod došel
                        </Button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {tab === "poptavky" && data ? (
        <div className="overflow-x-auto rounded-2xl border bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-3 py-2">Inzerent</th>
                <th className="px-3 py-2">Od</th>
                <th className="px-3 py-2">Stav</th>
                <th className="px-3 py-2">Zpráva</th>
              </tr>
            </thead>
            <tbody>
              {data.inquiries.map((row) => (
                <tr key={row.id} className="border-t align-top">
                  <td className="px-3 py-2">{row.advertiser}</td>
                  <td className="px-3 py-2 text-xs">
                    {row.sender_name}
                    <br />
                    {row.sender_email}
                  </td>
                  <td className="px-3 py-2">{statusCs(row.status)}</td>
                  <td className="px-3 py-2 text-xs text-slate-600">{row.message.slice(0, 180)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {tab === "pravni" && data ? (
        <section className="space-y-3 rounded-2xl border bg-white p-5 text-sm text-slate-700">
          <p>
            Studené B2B oslovení je ve výchozím stavu <strong>ke schválení</strong>. Automaticky se posílají
            jen odpovědi na poptávku, souhlas a stávající zákazníci.
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>SÚKL / zákon o léčivech: Rx jen na odborné ploše (tarif Klinický / Partner).</li>
            <li>Zákon o reklamě: každá plocha je označená jako inzerce.</li>
            <li>GDPR + 480/2004 Sb.: odhlášení jedním klikem, zákaz osobních mailboxů u LIA.</li>
            <li>Faktury: {data.legal.termsPath} · neplátce DPH dle ARES.</li>
            <li>
              Cold auto-send: {data.legal.coldAutoSend ? "zapnuto (SALES_AUTO_OUTBOUND)" : "vypnuto"} · max{" "}
              {data.legal.maxTouches} kontaktů · {data.legal.maxEmailsPerRun} e-mailů / běh.
            </li>
          </ul>
          <p>
            Dokumentace: <Link className="text-[#005B96] underline" href="/inzerce/podminky">veřejné podmínky</Link>
            . Interní popis v <code>docs/sales/AUTONOMOUS_SALES_DEPARTMENT.md</code>.
          </p>
        </section>
      ) : null}
    </div>
  );
}
