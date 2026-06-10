import type { Metadata } from "next";

import Link from "next/link";

import { MedScopeLogo } from "@/components/brand/medscope-logo";

import { readV25Json } from "@/lib/v25/data-store";

import { loadV25SystemState } from "@/lib/v25/system-state";

import { loadUniversitiesReport } from "@/lib/v25/universities";

import type { V25LinkTestReport } from "@/lib/v25/types";

import { verifyV25Apis } from "@/lib/v25/verify";

import { V25_ENGINE_VERSION, V25_ENGINE_LABEL } from "@/lib/v25/version";

import { SystemStatus } from "./components/SystemStatus";

import { TestHistory } from "./components/TestHistory";

import { FixHistory } from "./components/FixHistory";

import { CronStatus } from "./components/CronStatus";

import { ProviderStatus } from "./components/ProviderStatus";

import { UniversitySources } from "./components/UniversitySources";

import { Alerts } from "./components/Alerts";

import { Screenshots } from "./components/Screenshots";

import { NavigationTests } from "./components/NavigationTests";

import { LinkTests } from "./components/LinkTests";

import { ApiTable } from "./components/TestTable";

import { RunTestsButton } from "./components/RunTestsButton";



export const metadata: Metadata = {
  title: "Stav systému — Admin",
};



export const dynamic = "force-dynamic";



export default async function AdminSystemPage() {

  const state = loadV25SystemState();

  const live = await verifyV25Apis();

  const universities = state.universities ?? loadUniversitiesReport() ?? undefined;

  const linkReport = readV25Json<V25LinkTestReport>("v25/link-report.json");



  const merged = {

    ...state,

    apis: live.apis.length ? live.apis : state.apis,

    universities,

    providers: state.providers?.length

      ? state.providers

      : universities

        ? [

            {

              id: "universities",

              name: "České LF",

              status: universities.totals.failed === 0 ? ("ok" as const) : ("partial" as const),

              lastRunAt: universities.at,

              newItems: universities.totals.newArticles,

              updates: universities.totals.updates,

              errors: universities.totals.failed,

            },

          ]

        : [],

  };



  return (

    <div className="space-y-10">

      <div>

        <MedScopeLogo href="/admin" width={140} height={36} className="mb-4" />

        <h1 className="text-2xl font-semibold text-[#021d33]">
          Stav systému — {V25_ENGINE_VERSION} {V25_ENGINE_LABEL}
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">

          QA · SEO · Legal · Universities · LinkTest · Screenshots · NavMonitor · Autofix · Redeploy ·

          Rollback

        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-sm">

          <Link href="/admin" className="rounded-lg border px-3 py-1.5 hover:bg-muted">

            Admin

          </Link>

          <Link href="/admin/autopilot" className="rounded-lg border px-3 py-1.5 hover:bg-muted">

            Autopilot

          </Link>

          <Link href="/studium/univerzity" className="rounded-lg border px-3 py-1.5 hover:bg-muted">

            Univerzity

          </Link>

        </div>

      </div>



      <section className="space-y-4">

        <h2 className="text-lg font-semibold">Stav systému</h2>

        <SystemStatus

          tests={merged.tests}

          apis={merged.apis}

          crons={merged.crons}

          fixHistory={merged.fixHistory}

        />

        <RunTestsButton />

      </section>



      <section className="space-y-4">

        <h2 className="text-lg font-semibold">Testy</h2>

        <TestHistory tests={merged.tests} />

        <div className="grid gap-6 lg:grid-cols-2">

          <div>

            <h3 className="mb-2 text-sm font-medium text-muted-foreground">Link-test</h3>

            <LinkTests

              status={merged.tests.linkTest}

              navigation={merged.navigation}

              report={linkReport}

            />

          </div>

          <div>

            <h3 className="mb-2 text-sm font-medium text-muted-foreground">Navigation monitor</h3>

            <NavigationTests navigation={merged.navigation} />

          </div>

        </div>

        <div>

          <h3 className="mb-2 text-sm font-medium text-muted-foreground">Screenshot-test</h3>

          <Screenshots shots={merged.screenshots} />

        </div>

      </section>



      <section className="space-y-4">

        <h2 className="text-lg font-semibold">Opravy</h2>

        <FixHistory history={merged.fixHistory} />

      </section>



      <section className="space-y-4">

        <h2 className="text-lg font-semibold">CRONy</h2>

        <CronStatus crons={merged.crons} />

      </section>



      <section className="space-y-4">

        <h2 className="text-lg font-semibold">Provideři</h2>

        <ProviderStatus providers={merged.providers ?? []} />

      </section>



      <section className="space-y-4">

        <h2 className="text-lg font-semibold">Univerzity — české LF</h2>

        <UniversitySources universities={merged.universities} />

      </section>



      <section className="space-y-4">

        <h2 className="text-lg font-semibold">API</h2>

        <ApiTable apis={merged.apis} />

      </section>



      <section className="space-y-4">

        <h2 className="text-lg font-semibold">Alerty</h2>

        <Alerts alerts={merged.alerts} />

      </section>

    </div>

  );

}

