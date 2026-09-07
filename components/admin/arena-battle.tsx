"use client";

import { useEffect, useState } from "react";
import type { ArenaDashboard } from "@/lib/growth/arena/dashboard";

function formatInt(value: number): string {
  return value.toLocaleString("cs-CZ");
}

function countryName(code: string): string {
  try {
    return new Intl.DisplayNames(["cs"], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
}

function scoreCell(input: { visits: number; checkouts: number; paid: number }): string {
  return `${formatInt(input.visits)} / ${formatInt(input.checkouts)} / ${formatInt(input.paid)}`;
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

      <section
        className={`rounded-2xl border p-5 ${
          dash.verdict?.win
            ? "border-emerald-200 bg-emerald-50/40"
            : "border-amber-300 bg-amber-50/50"
        }`}
      >
        <h2 className="font-display text-xl font-semibold">Vyhodnocení závodu — 7 dní</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Úspěch a výhra jen za platící předplatitele. Návštěva, crawler, hop a košík jsou pipeline.
        </p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4 text-sm">
          <p className="rounded-lg border bg-white px-3 py-2">
            Verdikt
            <strong className="mt-1 block text-lg capitalize">
              {dash.verdict?.win
                ? dash.verdict.leader === "tie"
                  ? "remíza platících"
                  : dash.verdict.leader
                : "není výhra"}
            </strong>
          </p>
          <p className="rounded-lg border bg-white px-3 py-2">
            Platící teď / 7 dní Alfa–Beta
            <strong className="mt-1 block text-lg">
              {formatInt(dash.payingSubscribers ?? 0)} / {formatInt(dash.verdict?.paidAlfa7d ?? 0)}–
              {formatInt(dash.verdict?.paidBeta7d ?? 0)}
            </strong>
          </p>
          <p className="rounded-lg border bg-white px-3 py-2">
            Pipeline visit / checkout
            <strong className="mt-1 block text-lg">
              {formatInt(dash.pipeline?.visits7d ?? 0)} / {formatInt(dash.pipeline?.checkouts7d ?? 0)}
            </strong>
          </p>
          <p className="rounded-lg border bg-white px-3 py-2">
            Historické body Alfa / Beta
            <strong className="mt-1 block text-lg">
              {formatInt(alfa?.teamPoints ?? 0)} / {formatInt(beta?.teamPoints ?? 0)}
            </strong>
          </p>
        </div>
        {dash.verdict?.emptyReason ? (
          <p className="mt-3 text-sm text-amber-900">{dash.verdict.emptyReason}</p>
        ) : null}
      </section>

      <section className="rounded-2xl border border-[#005B96]/20 bg-white p-5">
        <h2 className="font-display text-xl font-semibold">Strategie — výhra jen platící</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Cron, IndexNow a hopy nenahradí Stripe. Dokud paid = 0, týmy nedostávají body, kvótu ani
          klony. Níže je pipeline, ne skóre.
        </p>
        <div className="mt-4 grid gap-2 sm:grid-cols-3 lg:grid-cols-6 text-sm">
          <p className="rounded-lg border bg-slate-50 px-3 py-2">
            Platící / živá vč. trial
            <strong className="mt-1 block text-lg">
              {formatInt(dash.payingSubscribers ?? 0)} / {formatInt(dash.liveSubscribers)}
            </strong>
          </p>
          <p className="rounded-lg border bg-slate-50 px-3 py-2">
            7 dní visit / checkout / paid
            <strong className="mt-1 block text-lg">
              {formatInt(dash.pipeline?.visits7d ?? 0)} / {formatInt(dash.pipeline?.checkouts7d ?? 0)} /{" "}
              {formatInt(dash.pipeline?.paid7d ?? 0)}
            </strong>
          </p>
          <p className="rounded-lg border bg-slate-50 px-3 py-2">
            IndexNow kvóta
            <strong className="mt-1 block text-lg">{formatInt(dash.pipeline?.indexNowQuota ?? 0)}</strong>
          </p>
          <p className="rounded-lg border bg-slate-50 px-3 py-2">
            Sociální drafty
            <strong className="mt-1 block text-lg">{formatInt(dash.pipeline?.socialDraftsHeld ?? 0)}</strong>
          </p>
          <p className="rounded-lg border bg-slate-50 px-3 py-2">
            Afrika mapována
            <strong className="mt-1 block text-lg">{formatInt(dash.pipeline?.africaMapped ?? 0)}</strong>
          </p>
          <p className="rounded-lg border bg-slate-50 px-3 py-2">
            Afrika s provozem
            <strong className="mt-1 block text-lg">{formatInt(dash.pipeline?.africaWithTraffic ?? 0)}</strong>
          </p>
        </div>
        <ol className="mt-4 list-decimal space-y-1 pl-5 text-sm text-slate-700">
          {(dash.pipeline?.nextActions ?? []).map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      </section>

      <section>
        <h2 className="mb-2 font-display text-xl font-semibold">Afrika — hotové mutace fr / en / pt / es</h2>
        <p className="mb-2 text-xs text-muted-foreground">
          Žádná nová locale (žádné sw/yo/am/ar). Maghreb → <code>/fr</code>, lusofonní → <code>/pt</code>,
          Guinej-Rovníková → <code>/es</code>, zbytek mezinárodní <code>/en</code> — ne <code>/en-us</code>.
          Návštěvy zůstanou 0, dokud z té země nepřijde hop.
        </p>
        {(dash.africa ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {formatInt(dash.pipeline?.africaMapped ?? 0)} zemí namapováno, zatím 0 s hopem.
          </p>
        ) : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-3 py-2 text-left">Země</th>
                <th className="px-3 py-2 text-left">Edice</th>
                <th className="px-3 py-2 text-right">Návštěvy</th>
                <th className="px-3 py-2 text-right">Checkout</th>
                <th className="px-3 py-2 text-right">Zaplaceno</th>
              </tr>
            </thead>
            <tbody>
              {(dash.africa ?? []).map((row) => {
                const live = row.visits + row.checkouts + row.paid > 0;
                return (
                  <tr key={row.country} className={`border-t ${live ? "bg-emerald-50/30" : ""}`}>
                    <td className="px-3 py-2 font-medium">
                      {row.country} · {countryName(row.country)}
                    </td>
                    <td className="px-3 py-2 text-xs text-slate-600">/{row.locale}</td>
                    <td className="px-3 py-2 text-right">{formatInt(row.visits)}</td>
                    <td className="px-3 py-2 text-right">{formatInt(row.checkouts)}</td>
                    <td className="px-3 py-2 text-right">{formatInt(row.paid)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        )}
      </section>

      <section>
        <h2 className="mb-2 font-display text-xl font-semibold">Sociální fronta — lidský post</h2>
        <p className="mb-2 text-xs text-muted-foreground">
          Instagram, Facebook, WhatsApp, LinkedIn. Cron draft drží a neodesílá. Cíl: předplatitelé
          Redakce a B2B <code>/firmy/reklama/nova</code>.
        </p>
        {(dash.socialQueue ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">Žádný draft — spusťte kolo, nebo počkejte na cron.</p>
        ) : (
          <ul className="space-y-2">
            {(dash.socialQueue ?? []).map((row, index) => (
              <li
                key={`${row.team}-${row.network ?? "social"}-${row.locale}-${index}`}
                className="rounded-lg border bg-white px-3 py-2 text-sm"
              >
                <p className="font-medium">
                  {row.network ?? "social"} · {row.locale} · {row.team}
                </p>
                <p className="text-xs text-slate-600">{row.headline}</p>
                <p className="mt-1 text-xs text-muted-foreground">{row.body}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        {[alfa, beta].map((team) => {
          if (!team) return null;
          const width = Math.round((Math.max(0, team.teamPoints) / maxPoints) * 100);
          const members = dash.members.filter((row) => row.teamSlug === team.slug);
          return (
            <article
              key={team.slug}
              className={`rounded-2xl border p-5 ${
                dash.verdict?.win && team.slug === dash.verdict.leader
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
        <h2 className="mb-2 font-display text-xl font-semibold">Hodnocení podle zemí</h2>
        <p className="mb-2 text-xs text-muted-foreground">
          Posledních 7 dní · sloupce Alfa/Beta = návštěvy / checkout / zaplaceno. Vede jen tým s
          více <em>zaplacenými</em> — visit/checkout = remíza.
          {dash.windowStart ? ` Okno od ${new Date(dash.windowStart).toLocaleString("cs-CZ")}.` : ""}
        </p>
        {(() => {
          const liveCountries = (dash.countries ?? []).filter((row) => row.activity > 0);
          const traffic = dash.countryTraffic ?? [];
          const alfaLead = liveCountries.filter((row) => row.leader === "alfa").length;
          const betaLead = liveCountries.filter((row) => row.leader === "beta").length;
          return (
            <div className="mb-3 grid gap-2 sm:grid-cols-3 text-sm">
              <p className="rounded-lg border bg-white px-3 py-2">
                Země s Alfa/Beta provozem: <strong>{formatInt(liveCountries.length)}</strong>
              </p>
              <p className="rounded-lg border bg-white px-3 py-2">
                Vede Alfa / Beta: <strong>{formatInt(alfaLead)}</strong> / <strong>{formatInt(betaLead)}</strong>
              </p>
              <p className="rounded-lg border bg-white px-3 py-2">
                Země s jakýmkoli agentem: <strong>{formatInt(traffic.length)}</strong>
              </p>
            </div>
          );
        })()}
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-3 py-2 text-left">Země</th>
                <th className="px-3 py-2 text-left">Edice</th>
                <th className="px-3 py-2 text-right">Alfa V/C/P</th>
                <th className="px-3 py-2 text-right">Beta V/C/P</th>
                <th className="px-3 py-2 text-left">Vede</th>
              </tr>
            </thead>
            <tbody>
              {(dash.countries ?? [])
                .filter((row) => row.activity > 0)
                .map((row) => (
                  <tr key={row.country} className="border-t bg-emerald-50/30">
                    <td className="px-3 py-2 font-medium">
                      {row.country} · {countryName(row.country)}
                    </td>
                    <td className="px-3 py-2 text-xs text-slate-600">{row.locale ?? "—"}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{scoreCell(row.alfa)}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{scoreCell(row.beta)}</td>
                    <td className="px-3 py-2">{row.leader === "tie" ? "remíza" : row.leader}</td>
                  </tr>
                ))}
              {(dash.countries ?? []).filter((row) => row.activity > 0).length === 0 ? (
                <tr className="border-t">
                  <td className="px-3 py-3 text-sm text-muted-foreground" colSpan={5}>
                    Za 7 dní žádná Alfa/Beta událost s ISO zemí. Hop a checkout teď zemi zapisují;
                    starší návštěvy bez <code>country</code> se sem nepočítají.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <h3 className="mb-2 mt-5 font-display text-lg font-semibold">Reálný provoz všech agentů podle země</h3>
        <p className="mb-2 text-xs text-muted-foreground">
          Stejné analytics okno. Sem spadne i ChatGPT / Perplexity, nejen Alfa a Beta.
        </p>
        {(dash.countryTraffic ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Žádná událost s ISO zemí. Bez <code>cf-ipcountry</code> nejde zemi přiřadit.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left">Země</th>
                  <th className="px-3 py-2 text-left">Edice</th>
                  <th className="px-3 py-2 text-right">Návštěvy</th>
                  <th className="px-3 py-2 text-right">Checkout</th>
                  <th className="px-3 py-2 text-right">Zaplaceno</th>
                  <th className="px-3 py-2 text-left">Nejčastější agent</th>
                </tr>
              </thead>
              <tbody>
                {(dash.countryTraffic ?? []).map((row) => (
                  <tr key={`traffic-${row.country}`} className="border-t">
                    <td className="px-3 py-2 font-medium">
                      {row.country} · {countryName(row.country)}
                    </td>
                    <td className="px-3 py-2 text-xs text-slate-600">{row.locale ?? "—"}</td>
                    <td className="px-3 py-2 text-right">{formatInt(row.visits)}</td>
                    <td className="px-3 py-2 text-right">{formatInt(row.checkouts)}</td>
                    <td className="px-3 py-2 text-right">{formatInt(row.paid)}</td>
                    <td className="px-3 py-2">
                      {row.topAgent ?? "—"}
                      {row.agents.length > 1 ? (
                        <span className="block text-[11px] text-slate-500">
                          {row.agents
                            .slice(0, 4)
                            .map((agent) => `${agent.agent} ${agent.visits}`)
                            .join(" · ")}
                        </span>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <h3 className="mb-2 mt-5 font-display text-lg font-semibold">Souboj podle jazykových mutací</h3>
        <p className="mb-2 text-xs text-muted-foreground">
          AT/CH se sčítají do <code>/de</code>, CA do <code>/en-us</code>. Sloupce znovu V/C/P.
        </p>
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-3 py-2 text-left">Mutace</th>
                <th className="px-3 py-2 text-left">Mapované země</th>
                <th className="px-3 py-2 text-right">Alfa V/C/P</th>
                <th className="px-3 py-2 text-right">Beta V/C/P</th>
                <th className="px-3 py-2 text-left">Vede</th>
              </tr>
            </thead>
            <tbody>
              {(dash.markets ?? []).every((row) => {
                const activity =
                  row.alfa.visits + row.alfa.checkouts + row.alfa.paid + row.beta.visits + row.beta.checkouts + row.beta.paid;
                return activity === 0;
              }) ? (
                <tr className="border-t">
                  <td className="px-3 py-3 text-sm text-muted-foreground" colSpan={5}>
                    Za 7 dní žádný Alfa/Beta hop v jazykové mutaci.
                  </td>
                </tr>
              ) : null}
              {(dash.markets ?? [])
                .slice()
                .sort((a, b) => {
                  const actA =
                    a.alfa.visits + a.alfa.checkouts + a.alfa.paid + a.beta.visits + a.beta.checkouts + a.beta.paid;
                  const actB =
                    b.alfa.visits + b.alfa.checkouts + b.alfa.paid + b.beta.visits + b.beta.checkouts + b.beta.paid;
                  return actB - actA || a.locale.localeCompare(b.locale);
                })
                .map((row) => {
                  const activity =
                    row.alfa.visits +
                    row.alfa.checkouts +
                    row.alfa.paid +
                    row.beta.visits +
                    row.beta.checkouts +
                    row.beta.paid;
                  return (
                    <tr key={row.locale} className={`border-t ${activity > 0 ? "bg-emerald-50/30" : ""}`}>
                      <td className="px-3 py-2 font-medium">
                        {row.locale} · {row.label}
                      </td>
                      <td className="px-3 py-2 text-xs text-slate-600">{row.countries.join(", ") || "—"}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{scoreCell(row.alfa)}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{scoreCell(row.beta)}</td>
                      <td className="px-3 py-2">{row.leader === "tie" ? "remíza" : row.leader}</td>
                    </tr>
                  );
                })}
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
                  <th className="px-3 py-2 text-left">Řez</th>
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
                    <td className="px-3 py-2 text-xs text-slate-600">{row.section ?? "—"}</td>
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
