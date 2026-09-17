"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Bot, Trophy, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AiOpsSnapshot, OpsAgent } from "@/lib/growth/ai-ops";

type Tab = "oddeleni" | "zebricek" | "cile";

const TABS: { id: Tab; label: string }[] = [
  { id: "oddeleni", label: "Oddělení" },
  { id: "zebricek", label: "Žebříček asistentů" },
  { id: "cile", label: "Cíle" },
];

function agentPipelineStatus(row: {
  visits: number;
  checkouts: number;
  paid: number;
  newsletters: number;
  agent?: string;
}): string {
  if (row.paid > 0) return "úspěch — platí";
  if (row.checkouts > 0) return "košík, neplatí";
  if (row.visits + row.newsletters > 0) return "crawler/hop/referer — neplatí";
  if (row.agent === "other") return "organika bez ?ref= — až někdo zaplatí bez hopu";
  return "IndexNow pingá — čeká na první hop, referer nebo crawler";
}

function formatInt(value: number): string {
  return value.toLocaleString("cs-CZ");
}

function formatCzk(value: number): string {
  return `${value.toLocaleString("cs-CZ")} Kč`;
}

function pct(part: number, whole: number): string {
  if (whole <= 0) return "0 %";
  return `${Math.min(999, Math.round((part / whole) * 1000) / 10)} %`;
}

function statusClass(status: OpsAgent["status"]): string {
  if (status === "done") return "border-emerald-200 bg-emerald-50 text-emerald-900";
  if (status === "work") return "border-sky-200 bg-sky-50 text-sky-900";
  if (status === "running") return "border-sky-200 bg-sky-50 text-sky-900";
  if (status === "blocked") return "border-red-200 bg-red-50 text-red-900";
  return "border-amber-200 bg-amber-50 text-amber-900";
}

export function AiAgentsDesk({ initial }: { initial: AiOpsSnapshot }) {
  const [data, setData] = useState(initial);
  const [tab, setTab] = useState<Tab>("oddeleni");
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/ai-ops", { credentials: "same-origin" });
      const json = (await res.json().catch(() => ({}))) as AiOpsSnapshot & { error?: string };
      if (json.agents && json.honesty) setData(json);
    } catch {
      /* keep last snapshot */
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requested = params.get("tab");
    if (requested && TABS.some((item) => item.id === requested)) setTab(requested as Tab);
  }, []);

  async function run(action: NonNullable<OpsAgent["action"]>) {
    setBusy(action);
    setNotice(null);
    try {
      const res = await fetch("/api/admin/ai-ops", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; note?: string };
      if (!res.ok) {
        setNotice(json.error || "Běh se nepovedl.");
      } else {
        setNotice(json.note || "Běh dokončen.");
      }
    } catch {
      setNotice("Síťová chyba při běhu agenta.");
    }
    await refresh();
    setBusy(null);
  }

  const snap = data;
  const near = snap.growth.goals.near;
  const sep27 = snap.growth.goals.sep27;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-medical-navy">AI agenti — dokončená práce</h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">{snap.honesty}</p>
        <p className="mt-1 text-xs text-slate-500">
          Zdroj: {snap.dataSource}. Stav k {new Date(snap.loadedAt).toLocaleString("cs-CZ")}.
          {snap.error ? ` · ${snap.error}` : ""}
        </p>
      </div>

      <p
        className={`rounded-xl border px-4 py-3 text-sm ${
          snap.nearMissed ? "border-red-200 bg-red-50 text-red-950" : "border-amber-200 bg-amber-50 text-amber-950"
        }`}
      >
        {snap.nearMissed ? (
          <>
            <strong>Cíl 10. 9. 2026 nesplněn.</strong> 170 000 předplatitelů se nestalo. Teď je{" "}
            <strong>{formatInt(snap.liveSubscribers)}</strong> živých (platící{" "}
            <strong>{formatInt(snap.payingSubscribers)}</strong>). 27. 9. (500 000) {snap.sep27Open ? "ještě běží" : "také vypršel"} — cron
            to nevymyslí. Níže je jen práce, kterou oddělení opravdu udělalo.
          </>
        ) : (
          <>Cíl 10. 9. ještě běží. Neslibujeme počty, které nejsou v databázi.</>
        )}
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card className={snap.v27PaidCzk > 0 ? "border-emerald-200" : "border-red-200"}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Peníze od předplatitelů</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCzk(snap.v27PaidCzk)}</p>
            <p className="text-xs text-muted-foreground">
              {formatInt(snap.v27PaidOrders)} zaplacených objednávek v27 · cíl 10. 9. nesplněn
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Živá předplatná</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatInt(snap.liveSubscribers)}</p>
            <p className="text-xs text-muted-foreground">
              platící {formatInt(snap.payingSubscribers)} · newsletter {formatInt(snap.newsletterSubscribers)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Články za 7 dní</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatInt(snap.articles7d)}</p>
            <p className="text-xs text-muted-foreground">
              24 h {formatInt(snap.articles24h)} · celkem {formatInt(snap.articlesPublished)} · práce, ne platba
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Newsletter tento týden</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatInt(snap.newsletterIssuesThisWeek)}</p>
            <p className="text-xs text-muted-foreground">
              mail {snap.mailTransport}
              {snap.lastEmailAt ? ` · poslední ${new Date(snap.lastEmailAt).toLocaleString("cs-CZ")}` : " · zatím žádný e-mail"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Obchodní e-maily</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatInt(snap.outreachSent)}</p>
            <p className="text-xs text-muted-foreground">
              odesláno · odpovědí {formatInt(snap.outreachReplied)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="AI agenti">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-pressed={tab === item.id}
            onClick={() => {
              setTab(item.id);
              const url = new URL(window.location.href);
              url.searchParams.set("tab", item.id);
              window.history.replaceState(null, "", `${url.pathname}${url.search}`);
            }}
            className={`rounded-full px-3 py-1.5 text-sm ${
              tab === item.id ? "bg-[#005B96] text-white" : "border border-slate-200 bg-white text-slate-700"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
      {notice ? (
        <p className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800">{notice}</p>
      ) : null}

      {tab === "oddeleni" ? (
        <section className="space-y-3" role="tabpanel">
          <h2 className="font-display text-xl font-semibold">Autonomní oddělení — co je hotové</h2>
          <div className="overflow-x-auto rounded-xl border bg-white">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-2 text-left">Agent</th>
                  <th className="px-4 py-2 text-left">Úkol</th>
                  <th className="px-4 py-2 text-left">Dokončeno</th>
                  <th className="px-4 py-2 text-left">Stav</th>
                  <th className="px-4 py-2 text-left">Akce</th>
                </tr>
              </thead>
              <tbody>
                {snap.agents.map((row) => (
                  <tr key={row.id} className="border-t align-top">
                    <td className="px-4 py-3 font-medium">{row.name}</td>
                    <td className="px-4 py-3 text-slate-600">{row.job}</td>
                    <td className="px-4 py-3">{row.completed}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs ${statusClass(row.status)}`}>
                        {row.statusLabel}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="outline" asChild>
                          <Link href={row.href}>Otevřít</Link>
                        </Button>
                        {row.action ? (
                          <Button
                            size="sm"
                            disabled={busy !== null}
                            onClick={() => void run(row.action!)}
                          >
                            {busy === row.action ? "Běží…" : "Spustit teď"}
                          </Button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {tab === "zebricek" ? (
        <section className="space-y-3" role="tabpanel">
          <h2 className="font-display text-xl font-semibold">Žebříček externích asistentů</h2>
          <p className="text-sm text-muted-foreground">
            ChatGPT, Claude, Gemini a další se z cronu nevolají. Pořadí je hop / crawler / Referer / Stripe. Návštěva
            není výhra.{" "}
            <Link href="/admin/ai-teams" className="font-medium text-[#005B96] hover:underline">
              Souboj Alfa/Beta
            </Link>
            .
          </p>
          <div className="overflow-x-auto rounded-xl border bg-white">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-2 text-left">#</th>
                  <th className="px-4 py-2 text-left">Agent</th>
                  <th className="px-4 py-2 text-left">Stav</th>
                  <th className="px-4 py-2 text-right">Návštěvy</th>
                  <th className="px-4 py-2 text-right">Checkout</th>
                  <th className="px-4 py-2 text-right">Newsletter</th>
                  <th className="px-4 py-2 text-right">Zaplaceno</th>
                </tr>
              </thead>
              <tbody>
                {snap.leaderboard.map((row, index) => (
                  <tr key={row.agent} className="border-t">
                    <td className="px-4 py-2">{index + 1}</td>
                    <td className="px-4 py-2 font-medium">{row.agent}</td>
                    <td className="px-4 py-2 text-muted-foreground">{agentPipelineStatus(row)}</td>
                    <td className="px-4 py-2 text-right">{formatInt(row.visits)}</td>
                    <td className="px-4 py-2 text-right">{formatInt(row.checkouts)}</td>
                    <td className="px-4 py-2 text-right">{formatInt(row.newsletters)}</td>
                    <td className="px-4 py-2 text-right">{formatInt(row.paid)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <section className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5">
            <h3 className="font-display text-lg font-semibold">Náprava — cíl je zaplacené předplatné</h3>
            <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm text-slate-800">
              {snap.remediations.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          </section>
        </section>
      ) : null}

      {tab === "cile" ? (
        <section className="space-y-4" role="tabpanel">
          <h2 className="font-display text-xl font-semibold">Programové cíle</h2>
          <Card className={snap.growth.visibility.visible ? "border-emerald-200 bg-emerald-50/40" : "border-amber-200 bg-amber-50/40"}>
            <CardHeader>
              <CardTitle className="text-base">Viditelnost nárůstu</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="font-medium text-[#021d33]">{snap.growth.visibility.label}</p>
              <p className={near.onTrack ? "text-emerald-800" : "text-red-800"}>
                Cíl 10. 9. (170 000 předplatitelů): {near.onTrack ? "splněn / na cestě" : "NESPLNĚNO"} — {near.label} · {pct(snap.liveSubscribers, near.target)}
              </p>
              <p className={sep27.onTrack ? "text-emerald-800" : "text-amber-800"}>
                Cíl 27. 9. (500 000): {sep27.onTrack ? "na cestě" : "mimo tempo"} — {sep27.label} · {pct(snap.liveSubscribers, sep27.target)}
              </p>
              <p className="text-slate-700">
                Peníze od předplatitelů: {formatCzk(snap.v27PaidCzk)} · platící {formatInt(snap.payingSubscribers)}.
              </p>
            </CardContent>
          </Card>
          <p className="text-sm">
            <Link href="/pro-ai" className="font-medium text-[#005B96] hover:underline">
              /pro-ai
            </Link>
            {" · "}
            <Link href="/llms.txt" className="font-medium text-[#005B96] hover:underline">
              llms.txt
            </Link>
            {" · "}
            <Link href="/admin/ai-teams" className="font-medium text-[#005B96] hover:underline">
              Aréna
            </Link>
            {" · "}
            <Link href="/admin/sales" className="font-medium text-[#005B96] hover:underline">
              Obchod
            </Link>
            {" · "}
            <Link href="/admin/revenue" className="font-medium text-[#005B96] hover:underline">
              Tržby
            </Link>
          </p>
        </section>
      ) : null}
    </div>
  );
}
