import type { Metadata } from "next";
import Link from "next/link";
import { MedScopeLogo } from "@/components/brand/medscope-logo";
import { loadV25SystemStateAsync } from "@/lib/v25/system-state";
import { V25_ENGINE_VERSION } from "@/lib/v25/version";
import { TestTable } from "./components/TestTable";
import { TestRunButton } from "./components/TestRunButton";
import { TestHistory } from "./components/TestHistory";

export const metadata: Metadata = {
  title: "Testy — Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminTestsPage() {
  const state = await loadV25SystemStateAsync();
  const lastSuite = state.lastTestSuite;
  const history = state.testRuns ?? (lastSuite ? [lastSuite] : []);

  return (
    <div className="space-y-8">
      <div>
        <MedScopeLogo href="/admin/tests" width={160} height={40} className="mb-3" />
        <h1 className="font-display text-2xl font-bold text-[#021d33]">
          Test suite — {V25_ENGINE_VERSION}
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Routing · odkazy · navigace · API health · ad engines · veřejnost · odborná · CLK stub
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-sm">
          <Link href="/admin" className="rounded-lg border px-3 py-1.5 hover:bg-muted">
            Admin
          </Link>
          <Link href="/admin/system" className="rounded-lg border px-3 py-1.5 hover:bg-muted">
            Stav systému
          </Link>
          <Link href="/admin/ads-overview" className="rounded-lg border px-3 py-1.5 hover:bg-muted">
            Ads overview
          </Link>
        </div>
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Spuštění</h2>
        <TestRunButton />
        {lastSuite ? (
          <p className="text-xs text-muted-foreground">
            Poslední běh: {new Date(lastSuite.at).toLocaleString("cs-CZ")} ·{" "}
            {lastSuite.ok ? "PASS" : "FAIL"} · {lastSuite.durationMs} ms
          </p>
        ) : null}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Poslední výsledky</h2>
        <TestTable cases={lastSuite?.cases ?? []} />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Historie běhů</h2>
        <TestHistory runs={history} />
      </section>
    </div>
  );
}
