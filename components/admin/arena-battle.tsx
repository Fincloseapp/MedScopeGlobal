"use client";

import { useEffect, useState } from "react";
import type { ArenaDashboard } from "@/lib/growth/arena/dashboard";

function formatInt(value: number): string {
  return value.toLocaleString("cs-CZ");
}

export function ArenaBattle({ initial }: { initial: ArenaDashboard }) {
  const [dash, setDash] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [tickMsg, setTickMsg] = useState<string | null>(null);

  useEffect(() => {
    const id = window.setInterval(() => {
      void fetch("/api/growth/arena/status", { credentials: "same-origin" })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.teams) setDash(data as ArenaDashboard);
        })
        .catch(() => undefined);
    }, 10_000);
    return () => window.clearInterval(id);
  }, []);

  async function runTick() {
    setBusy(true);
    setTickMsg(null);
    try {
      const res = await fetch("/api/growth/arena/tick", {
        method: "POST",
        credentials: "same-origin",
      });
      const body = (await res.json()) as { actions?: string[]; error?: string };
      setTickMsg((body.actions ?? [body.error ?? "ok"]).slice(0, 4).join(" · "));
      const status = await fetch("/api/growth/arena/status", { credentials: "same-origin" });
      if (status.ok) setDash((await status.json()) as ArenaDashboard);
    } catch (err) {
      setTickMsg(err instanceof Error ? err.message : "tick selhal");
    } finally {
      setBusy(false);
    }
  }

  const alfa = dash.teams.find((row) => row.slug === "alfa");
  const beta = dash.teams.find((row) => row.slug === "beta");
  const maxPoints = Math.max(1, ...dash.teams.map((row) => row.teamPoints), 1);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          Obnova každých 10 s · {new Date(dash.loadedAt).toLocaleString("cs-CZ")}
        </p>
        <button
          type="button"
          onClick={() => void runTick()}
          disabled={busy}
          className="rounded-full bg-[#005B96] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {busy ? "Kolo běží…" : "Spustit kolo souboje"}
        </button>
      </div>
      {tickMsg ? <p className="text-sm text-slate-700">{tickMsg}</p> : null}

      <div className="grid gap-4 lg:grid-cols-2">
        {[alfa, beta].map((team) => {
          if (!team) return null;
          const width = Math.round((Math.max(0, team.teamPoints) / maxPoints) * 100);
          const members = dash.members.filter((row) => row.teamSlug === team.slug);
          return (
            <article
              key={team.slug}
              className={`rounded-2xl border p-5 ${
                team.slug === dash.leaderboard[0]?.slug
                  ? "border-emerald-300 bg-emerald-50/40"
                  : "border-slate-200 bg-white"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="font-display text-2xl font-bold">{team.name}</h2>
                  <p className="text-xs text-muted-foreground">
                    gen {team.generation} · {team.status} · styl {team.styleBias}
                  </p>
                </div>
                <p className="text-3xl font-bold">{formatInt(team.teamPoints)}</p>
              </div>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full bg-[#005B96]" style={{ width: `${width}%` }} />
              </div>
              <p className="mt-2 text-xs text-slate-600">
                Organický kvót {team.reachQuota} URL · limit {team.messageLimit} · série proher{" "}
                {team.losingStreak}
              </p>
              <ul className="mt-3 grid gap-2 sm:grid-cols-3">
                {members.map((member) => (
                  <li key={member.slug} className="rounded-lg border bg-white px-2 py-2 text-xs">
                    <p className="font-medium capitalize">{member.role}</p>
                    <p className="text-lg font-semibold">{formatInt(member.points)}</p>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-[11px] text-slate-500">
                Účty: {team.socialAccounts.map((item) => item.handle).join(" · ")} — kvóta dosahu,
                ne auto-post.
              </p>
            </article>
          );
        })}
      </div>

      <section>
        <h2 className="mb-2 font-display text-xl font-semibold">Souboj podle mutací a zemí</h2>
        <p className="mb-2 text-xs text-muted-foreground">
          Autonomně každých 5 minut. Země se počítají do jazykové edice (AT/CH → DE, CA → EN-US).
        </p>
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-3 py-2 text-left">Mutace</th>
                <th className="px-3 py-2 text-left">Země</th>
                <th className="px-3 py-2 text-right">Alfa</th>
                <th className="px-3 py-2 text-right">Beta</th>
                <th className="px-3 py-2 text-left">Vede</th>
              </tr>
            </thead>
            <tbody>
              {(dash.markets ?? []).map((row) => (
                <tr key={row.locale} className="border-t">
                  <td className="px-3 py-2 font-medium">
                    {row.locale} · {row.label}
                  </td>
                  <td className="px-3 py-2 text-xs text-slate-600">{row.countries.join(", ") || "—"}</td>
                  <td className="px-3 py-2 text-right">{row.alfa.conversions}</td>
                  <td className="px-3 py-2 text-right">{row.beta.conversions}</td>
                  <td className="px-3 py-2">{row.leader === "tie" ? "remíza" : row.leader}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="mb-2 font-display text-xl font-semibold">Žebříček týmů</h2>
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-3 py-2 text-left">Tým</th>
                <th className="px-3 py-2 text-right">Body</th>
                <th className="px-3 py-2 text-right">Kvóta</th>
                <th className="px-3 py-2 text-left">Stav</th>
              </tr>
            </thead>
            <tbody>
              {dash.leaderboard.map((row) => (
                <tr key={row.slug} className="border-t">
                  <td className="px-3 py-2 font-medium">{row.name}</td>
                  <td className="px-3 py-2 text-right">{formatInt(row.teamPoints)}</td>
                  <td className="px-3 py-2 text-right">{row.reachQuota}</td>
                  <td className="px-3 py-2">{row.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="mb-2 font-display text-xl font-semibold">Sdílená paměť</h2>
        {dash.knowledge.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Zatím žádný K ≥ 1.5. Analyst zapisuje jen když okno 10 min opravdu konvertuje.
          </p>
        ) : (
          <ul className="space-y-2">
            {dash.knowledge.map((row) => (
              <li key={row.id} className="rounded-lg border bg-white px-3 py-2 text-sm">
                <span className="font-medium">{row.teamSlug}</span> · {row.section} · {row.styleKey} ·
                K {row.kFactor}
                <p className="text-xs text-muted-foreground">{row.insight}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-2 font-display text-xl font-semibold">ai_agent_metrics</h2>
        {dash.metrics.length === 0 ? (
          <p className="text-sm text-muted-foreground">Po prvním kole se sem zapíšou hodinová okna.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left">Tým</th>
                  <th className="px-3 py-2 text-right">Visit</th>
                  <th className="px-3 py-2 text-right">Checkout</th>
                  <th className="px-3 py-2 text-right">Paid</th>
                  <th className="px-3 py-2 text-right">K</th>
                  <th className="px-3 py-2 text-right">Body</th>
                </tr>
              </thead>
              <tbody>
                {dash.metrics.slice(0, 12).map((row, index) => (
                  <tr key={`${row.teamSlug}-${row.createdAt}-${index}`} className="border-t">
                    <td className="px-3 py-2">{row.teamSlug}</td>
                    <td className="px-3 py-2 text-right">{row.visits}</td>
                    <td className="px-3 py-2 text-right">{row.checkouts}</td>
                    <td className="px-3 py-2 text-right">{row.paid}</td>
                    <td className="px-3 py-2 text-right">{row.kFactor}</td>
                    <td className="px-3 py-2 text-right">{row.pointsDelta}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-2 font-display text-xl font-semibold">Evoluce</h2>
        {dash.evolution.length === 0 ? (
          <p className="text-sm text-muted-foreground">Zatím žádné usmrcení ani klonování.</p>
        ) : (
          <ul className="space-y-1 text-sm">
            {dash.evolution.map((row, index) => (
              <li key={`${row.createdAt}-${index}`}>
                <span className="font-medium">{row.action}</span> — {row.detail}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
