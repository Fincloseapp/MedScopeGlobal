import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { V25TestSuite } from "@/lib/v25/types";
import { cn } from "@/lib/utils";

function badge(status: string) {
  const map: Record<string, string> = {
    ok: "bg-emerald-100 text-emerald-800",
    fail: "bg-red-100 text-red-800",
    pending: "bg-amber-100 text-amber-800",
    skipped: "bg-slate-100 text-slate-600",
    partial: "bg-orange-100 text-orange-800",
    none: "bg-slate-100 text-slate-600",
  };
  return map[status] ?? map.pending;
}

const LABELS: { key: keyof V25TestSuite; label: string }[] = [
  { key: "linkTest", label: "LinkTest" },
  { key: "screenshotTest", label: "ScreenshotTest" },
  { key: "navigationMonitor", label: "NavigationMonitor" },
  { key: "imagePipeline", label: "ImagePipeline" },
  { key: "verifyEngine", label: "VerifyEngine" },
  { key: "buildStatus", label: "BuildStatus" },
  { key: "ciStatus", label: "CI Status" },
];

export function StatusCards({ tests }: { tests: V25TestSuite }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {LABELS.map(({ key, label }) => (
        <Card key={key}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
          </CardHeader>
          <CardContent>
            <span
              className={cn(
                "inline-flex rounded-full px-3 py-1 text-sm font-semibold uppercase",
                badge(tests[key] as string)
              )}
            >
              {tests[key] as string}
            </span>
            {key === "linkTest" && tests.updatedAt ? (
              <p className="mt-2 text-xs text-muted-foreground">
                Aktualizováno: {new Date(tests.updatedAt).toLocaleString("cs-CZ")}
              </p>
            ) : null}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
