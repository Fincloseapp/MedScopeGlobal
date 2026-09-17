import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdminApiAuthorized } from "@/lib/auth/admin-api";
import { emptyOps, loadAiOpsSnapshot } from "@/lib/growth/ai-ops";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const schema = z.object({
  action: z.enum(["run_editorial", "run_newsletter", "run_sales", "run_marketplace", "run_arena", "run_growth"]),
});

async function assertAdmin(request: Request) {
  if (await isAdminApiAuthorized(request)) return;
  throw new Error("unauthorized");
}

export async function GET(request: Request) {
  if (!(await isAdminApiAuthorized(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const snap = await loadAiOpsSnapshot();
    return NextResponse.json(snap);
  } catch (err) {
    const message = err instanceof Error ? err.message : "ai_ops_failed";
    return NextResponse.json(emptyOps(message));
  }
}

export async function POST(request: Request) {
  try {
    await assertAdmin(request);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: z.infer<typeof schema>;
  try {
    body = schema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  try {
    if (body.action === "run_editorial") {
      const { processEditorialQueue } = await import("@/lib/ecosystem/editorial");
      const result = await processEditorialQueue({ maxJobs: 2, maxArticles: 2 });
      return NextResponse.json({ ...result, ok: result.ok, note: result.note });
    }
    if (body.action === "run_newsletter") {
      const { generateNewsletterIssue } = await import("@/lib/v4c/newsletter-generate");
      const result = await generateNewsletterIssue({ force: true });
      if (result.skipped) {
        return NextResponse.json({ ...result, ok: true, note: `Přeskočeno: ${result.reason}` });
      }
      return NextResponse.json({
        ...result,
        ok: true,
        note: `Vydání ${result.slug} · ${result.editions.length} mutací`,
      });
    }
    if (body.action === "run_sales") {
      const { runSalesDepartmentTick } = await import("@/lib/sales/runner");
      const result = await runSalesDepartmentTick();
      return NextResponse.json({
        ...result,
        ok: result.ok,
        note: result.ok ? "Obchodní běh dokončen." : "Obchodní běh s chybami.",
      });
    }
    if (body.action === "run_marketplace") {
      const { runMarketplaceLoopModel } = await import("@/lib/sales/marketplace-loop");
      const result = await runMarketplaceLoopModel({ persist: true });
      return NextResponse.json({
        ...result,
        ok: result.ok,
        note: `Smyčka ${result.evaluation.percent} % · ${result.evaluation.summary}`,
      });
    }
    if (body.action === "run_arena") {
      const { runArenaTick } = await import("@/lib/growth/arena/tick");
      const result = await runArenaTick();
      return NextResponse.json({
        ...result,
        ok: result.ok,
        note: result.actions.slice(0, 3).join(" · ") || "Aréna tick.",
      });
    }
    const { runLegalGrowthSprint } = await import("@/lib/growth/legal-sprint");
    const result = await runLegalGrowthSprint({ includeRevenueOps: false });
    return NextResponse.json({
      ...result,
      ok: result.ok,
      note: result.actions.slice(0, 3).join(" · ") || "Growth sprint.",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "ai_ops_action_failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
