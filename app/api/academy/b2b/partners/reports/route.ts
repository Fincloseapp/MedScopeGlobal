import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  assertPartnerReporterAccess,
  buildClkCsv,
  buildClkExcelXml,
  fetchPartnerCompletionRows,
  resolveReportWindow,
} from "@/lib/academy/b2b/reporting";
import type { ReportPeriod } from "@/types/academy-b2b";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ error: "Auth není dostupná" }, { status: 401 });
    }

    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) {
      return NextResponse.json({ error: "Přihlaste se" }, { status: 401 });
    }

    const url = new URL(request.url);
    const partnerId = url.searchParams.get("partner_id");
    const period = (url.searchParams.get("period") ?? "monthly") as ReportPeriod;
    const format = (url.searchParams.get("format") ?? "csv") as "csv" | "xlsx";

    if (!partnerId) {
      return NextResponse.json({ error: "Chybí partner_id" }, { status: 400 });
    }
    if (period !== "monthly" && period !== "quarterly") {
      return NextResponse.json({ error: "Neplatné období" }, { status: 400 });
    }

    const allowed = await assertPartnerReporterAccess(partnerId, auth.user.id);
    if (!allowed) {
      return NextResponse.json({ error: "Neautorizováno" }, { status: 403 });
    }

    const window = resolveReportWindow(period);
    const rows = await fetchPartnerCompletionRows({
      partnerInstitutionId: partnerId,
      period,
      from: window.from.toISOString(),
      to: window.to.toISOString(),
      format,
    });

    if (format === "xlsx") {
      const xml = buildClkExcelXml(rows);
      return new NextResponse(xml, {
        status: 200,
        headers: {
          "Content-Type": "application/vnd.ms-excel; charset=utf-8",
          "Content-Disposition": `attachment; filename="clk-export-${window.label}.xls"`,
          "X-Report-Row-Count": String(rows.length),
          "Cache-Control": "private, no-store",
        },
      });
    }

    const csv = buildClkCsv(rows);
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="clk-export-${window.label}.csv"`,
        "X-Report-Row-Count": String(rows.length),
        "Cache-Control": "private, no-store",
      },
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: (e as Error).message },
      { status: 500 }
    );
  }
}
