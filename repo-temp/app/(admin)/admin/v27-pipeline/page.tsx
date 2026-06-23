import Link from "next/link";
import { Bot, Newspaper, ImageIcon, Clock } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { V27_ENGINE_VERSION } from "@/lib/v27/version";
import { V27_EDITORIAL_AUDIENCES } from "@/lib/v27/editorial";
import { V27_AI_WRITERS } from "@/lib/v27/ai-writers";

export const dynamic = "force-dynamic";

export default async function AdminV27PipelinePage() {
  let healthOk = false;
  let healthVersion = "";
  try {
    const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const res = await fetch(`${base}/api/v27/health`, { cache: "no-store" });
    const json = await res.json();
    healthOk = json.ok === true;
    healthVersion = json.version ?? "";
  } catch {
    healthOk = false;
  }

  const cards = [
    {
      label: "v27 API health",
      value: healthOk ? `OK (${healthVersion})` : "Nedostupné",
      icon: Bot,
    },
    { label: "Editorial audiences", value: V27_EDITORIAL_AUDIENCES.length, icon: Newspaper },
    { label: "AI writers", value: V27_AI_WRITERS.length, icon: Bot },
    { label: "Cron backfill", value: "v26 engine → v27 tag", icon: Clock },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-medical-navy">Content pipeline v27</h1>
        <p className="text-muted-foreground">
          Editorial engine {V27_ENGINE_VERSION} — rozšíření v26 A–D, personas, foreign news
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{c.label}</CardTitle>
              <c.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{c.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">AI writers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {V27_AI_WRITERS.map((w) => (
              <div key={w.id} className="rounded-lg border p-3">
                <p className="font-medium">{w.name}</p>
                <p className="text-muted-foreground">{w.role}</p>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Monitoring</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Link href="/admin/clk-verifications" className="flex items-center gap-2 text-[#005B96] hover:underline">
              <Bot className="h-4 w-4" /> ČLK ověření
            </Link>
            <Link href="/admin/images" className="flex items-center gap-2 text-[#005B96] hover:underline">
              <ImageIcon className="h-4 w-4" /> Image pipeline (v25)
            </Link>
            <Link href="/admin/ingestion" className="flex items-center gap-2 text-[#005B96] hover:underline">
              <Newspaper className="h-4 w-4" /> AI ingestion
            </Link>
            <Link href="/api/v26/health" className="flex items-center gap-2 text-[#005B96] hover:underline">
              v26 editorial health →
            </Link>
            <Link href="/api/v27/health" className="flex items-center gap-2 text-[#005B96] hover:underline">
              v27 platform health →
            </Link>
          </CardContent>
        </Card>
      </section>

      <Link href="/admin/revenue" className="text-sm text-[#005B96] hover:underline">
        ← Revenue dashboard
      </Link>
    </div>
  );
}
