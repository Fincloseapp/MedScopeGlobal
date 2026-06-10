import type { Metadata } from "next";
import Link from "next/link";
import { MedScopeLogo } from "@/components/brand/medscope-logo";
import { loadV25SystemState } from "@/lib/v25/system-state";
import { verifyV25Apis } from "@/lib/v25/verify";
import { V25_ENGINE_VERSION, V25_ENGINE_LABEL } from "@/lib/v25/version";
import { StatusCards } from "./components/StatusCards";
import { ApiTable, CronTable, NavTable } from "./components/TestTable";
import { AlertsList, FixHistoryTable, ScreenshotGrid } from "./components/HistoryLog";
import { RunTestsButton } from "./components/RunTestsButton";

export const metadata: Metadata = {
  title: "System Dashboard — v25.1",
};

export const dynamic = "force-dynamic";

export default async function AdminSystemPage() {
  const state = loadV25SystemState();
  const live = await verifyV25Apis();
  const merged = { ...state, apis: live.apis.length ? live.apis : state.apis };

  return (
    <div className="space-y-10">
      <div>
        <MedScopeLogo href="/admin" width={140} height={36} className="mb-4" />
        <h1 className="text-2xl font-semibold text-[#021d33]">
          {V25_ENGINE_VERSION} {V25_ENGINE_LABEL}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Autonomní QA · SEO · Legal · Monitoring · LinkTest · Screenshots · NavMonitor · Autofix
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-sm">
          <Link href="/admin" className="rounded-lg border px-3 py-1.5 hover:bg-muted">
            Admin
          </Link>
          <Link href="/admin/autopilot" className="rounded-lg border px-3 py-1.5 hover:bg-muted">
            Autopilot
          </Link>
        </div>
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Stav posledních testů</h2>
        <StatusCards tests={merged.tests} />
        <RunTestsButton />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Historie oprav</h2>
        <FixHistoryTable history={merged.fixHistory} />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Stav CRONů</h2>
        <CronTable crons={merged.crons} />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Stav API</h2>
        <ApiTable apis={merged.apis} />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Stav navigace</h2>
        <NavTable navigation={merged.navigation} />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Screenshoty</h2>
        <ScreenshotGrid shots={merged.screenshots} />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Alerty</h2>
        <AlertsList alerts={merged.alerts} />
      </section>
    </div>
  );
}
