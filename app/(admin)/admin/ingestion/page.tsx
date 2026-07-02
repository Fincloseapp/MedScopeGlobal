import Link from "next/link";
import { Bot, Play, RefreshCw } from "lucide-react";
import { getIngestionStatus, triggerIngestionNow, updateIngestionSchedule } from "@/lib/actions/ingestion";
import { isAiConfigured } from "@/lib/ingestion/ai";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

async function runNowAction() {
  "use server";
  await triggerIngestionNow();
}

async function saveScheduleAction(formData: FormData) {
  "use server";
  await updateIngestionSchedule({
    enabled: formData.get("enabled") === "on",
    intervalHours: Number(formData.get("interval_hours")) || 6,
    maxPerRun: Number(formData.get("max_per_run")) || 24,
  });
}

export default async function AdminIngestionPage() {
  const status = await getIngestionStatus();
  const aiOn = isAiConfigured();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="flex items-center gap-2 font-display text-3xl font-bold text-medical-navy">
          <Bot className="h-8 w-8 text-primary" />
          AI ingestion
        </h1>
        <p className="mt-2 max-w-3xl text-muted-foreground">
          Automatically fetches articles from WHO, NIH, CDC, BMJ, Lancet, EMA,
          and PubMed by medical category. AI synthesizes evidence-based briefings
          into MedScopeGlobal.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>AI engine</CardTitle>
            <CardDescription>OpenAI powers full editorial synthesis</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Status:{" "}
              <span
                className={
                  aiOn ? "font-semibold text-green-700" : "font-semibold text-amber-700"
                }
              >
                {aiOn ? "Active (OPENAI_API_KEY or OPEN_API_KEY set)" : "Fallback mode (metadata only)"}
              </span>
            </p>
            {!aiOn && (
              <p className="mt-2 text-xs text-muted-foreground">
                Add <code>OPENAI_API_KEY</code> or <code>OPEN_API_KEY</code> to <code>.env.local</code> for full
                AI summaries, category mapping, and access levels.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Schedule</CardTitle>
            <CardDescription>Cron: GET /api/cron/ingest</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={saveScheduleAction} className="space-y-3">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="enabled"
                  defaultChecked={status?.schedule?.enabled ?? true}
                />
                Automatic ingestion enabled
              </label>
              <div className="flex gap-3">
                <label className="text-sm">
                  Every{" "}
                  <input
                    type="number"
                    name="interval_hours"
                    min={1}
                    max={48}
                    defaultValue={status?.schedule?.interval_hours ?? 6}
                    className="w-16 rounded border px-2 py-1"
                  />{" "}
                  hours
                </label>
                <label className="text-sm">
                  Max{" "}
                  <input
                    type="number"
                    name="max_per_run"
                    min={1}
                    max={50}
                    defaultValue={status?.schedule?.max_articles_per_run ?? 24}
                    className="w-16 rounded border px-2 py-1"
                  />{" "}
                  / run
                </label>
              </div>
              <Button type="submit" variant="secondary" size="sm">
                Save schedule
              </Button>
            </form>
            {status?.schedule?.last_run_at && (
              <p className="mt-3 text-xs text-muted-foreground">
                Last run: {new Date(status.schedule.last_run_at).toLocaleString()}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Run now</CardTitle>
            <CardDescription>
              Pull latest items from all configured global sources
            </CardDescription>
          </div>
          <form action={runNowAction}>
            <Button type="submit" className="gap-2">
              <Play className="h-4 w-4" />
              Start ingestion
            </Button>
          </form>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Recent runs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Started</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Skipped</TableHead>
                <TableHead>Trigger</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(status?.runs ?? []).map((run) => (
                <TableRow key={run.id}>
                  <TableCell className="text-xs">
                    {new Date(run.started_at).toLocaleString()}
                  </TableCell>
                  <TableCell>{run.status}</TableCell>
                  <TableCell>{run.articles_created}</TableCell>
                  <TableCell>{run.articles_skipped}</TableCell>
                  <TableCell className="text-xs">{run.triggered_by}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {(status?.runs ?? []).length === 0 && (
            <p className="text-sm text-muted-foreground">
              No runs yet. Run migration 003 and click Start ingestion.
            </p>
          )}
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground">
        Setup guide: see <code>docs/LAUNCH.md</code> in the repository. View ingested articles in{" "}
        <Link href="/admin/articles" className="text-primary underline">
          Articles
        </Link>
        .
      </p>
    </div>
  );
}
