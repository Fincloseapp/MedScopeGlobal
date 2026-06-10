import type { Metadata } from "next";
import Link from "next/link";
import { loadV25SystemState } from "@/lib/v25/system-state";
import { verifyV25Apis } from "@/lib/v25/verify";
import { V25_ENGINE_LABEL, V25_ENGINE_VERSION } from "@/lib/v25/version";

export const metadata: Metadata = {
  title: "Stav systému — MedScopeGlobal",
  description: "Veřejný přehled zdraví engine v25.1, API a testů.",
};

export const dynamic = "force-dynamic";

function statusColor(status: string) {
  if (status === "ok") return "text-emerald-700 bg-emerald-50";
  if (status === "fail") return "text-red-700 bg-red-50";
  return "text-amber-800 bg-amber-50";
}

export default async function StavSystemuPage() {
  const state = loadV25SystemState();
  const live = await verifyV25Apis();

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <nav className="text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Domů
        </Link>
        <span className="mx-2">/</span>
        <span>Stav systému</span>
      </nav>

      <div className="mt-4 rounded-2xl bg-[#f0f7ff] p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
          {V25_ENGINE_VERSION} {V25_ENGINE_LABEL}
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold text-[#021d33]">Stav systému</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Veřejný přehled autonomního engine — API, testy a poslední běhy. Plný admin dashboard:{" "}
          <Link href="/admin/system" className="text-primary hover:underline">
            /admin/system
          </Link>{" "}
          (po přihlášení).
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {(
          [
            ["Build", state.tests.buildStatus],
            ["CI", state.tests.ciStatus],
            ["Link-test", state.tests.linkTest],
            ["Screenshoty", state.tests.screenshotTest],
            ["Navigace", state.tests.navigationMonitor],
            ["Verify", state.tests.verifyEngine],
          ] as const
        ).map(([label, status]) => (
          <div key={label} className="rounded-xl border bg-white p-4">
            <p className="text-sm text-muted-foreground">{label}</p>
            <span
              className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase ${statusColor(status)}`}
            >
              {status}
            </span>
          </div>
        ))}
      </div>

      <section className="mt-8 rounded-xl border bg-white p-6">
        <h2 className="text-lg font-semibold text-[#021d33]">API</h2>
        <ul className="mt-4 space-y-2 text-sm">
          {(live.apis.length ? live.apis : state.apis).map((a) => (
            <li key={a.path} className="flex justify-between gap-4">
              <span className="font-mono text-xs">{a.path}</span>
              <span className={a.ok ? "text-emerald-700" : "text-red-600"}>
                {a.ok ? `OK ${a.status}` : `FAIL ${a.status || "—"}`}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6 rounded-xl border bg-white p-6">
        <h2 className="text-lg font-semibold text-[#021d33]">Moduly</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/studium/univerzity" className="rounded-full border px-3 py-1.5 text-sm hover:bg-muted">
            Lékařské fakulty
          </Link>
          <Link href="/ai" className="rounded-full border px-3 py-1.5 text-sm hover:bg-muted">
            AI Medical
          </Link>
          <Link href="/admin/system" className="rounded-full border px-3 py-1.5 text-sm hover:bg-muted">
            Admin observability
          </Link>
        </div>
      </section>
    </div>
  );
}
