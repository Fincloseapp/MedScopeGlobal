import { createServiceRoleClient } from "@/lib/supabase/service";
import type { ClkExportRow, PartnerReportQuery, ReportPeriod } from "@/types/academy-b2b";
import { splitFullName } from "@/lib/academy/b2b/verification";

export function resolveReportWindow(
  period: ReportPeriod,
  referenceDate = new Date()
): { from: Date; to: Date; label: string } {
  const ref = new Date(referenceDate);
  if (period === "quarterly") {
    const quarter = Math.floor(ref.getUTCMonth() / 3);
    const from = new Date(Date.UTC(ref.getUTCFullYear(), quarter * 3, 1));
    const to = new Date(Date.UTC(ref.getUTCFullYear(), quarter * 3 + 3, 1));
    return {
      from,
      to,
      label: `Q${quarter + 1}-${ref.getUTCFullYear()}`,
    };
  }

  const from = new Date(Date.UTC(ref.getUTCFullYear(), ref.getUTCMonth(), 1));
  const to = new Date(Date.UTC(ref.getUTCFullYear(), ref.getUTCMonth() + 1, 1));
  const label = `${String(ref.getUTCMonth() + 1).padStart(2, "0")}-${ref.getUTCFullYear()}`;
  return { from, to, label };
}

function csvEscape(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/** ČLK portal bulk-upload CSV (UTF-8 BOM for Excel compatibility). */
export function buildClkCsv(rows: ClkExportRow[]): string {
  const header = [
    "First Name",
    "Last Name",
    "CLK ID",
    "Course Title",
    "Accreditation Number",
    "Completion Date",
  ];

  const lines = [
    header.join(","),
    ...rows.map((r) =>
      [
        csvEscape(r.firstName),
        csvEscape(r.lastName),
        csvEscape(r.clkId),
        csvEscape(r.courseTitle),
        csvEscape(r.accreditationNumber),
        csvEscape(r.completionDate),
      ].join(",")
    ),
  ];

  return `\uFEFF${lines.join("\r\n")}`;
}

/**
 * SpreadsheetML (.xls) — opens natively in Excel without extra deps.
 * Exact columns required for ČLK bulk upload.
 */
export function buildClkExcelXml(rows: ClkExportRow[]): string {
  const header = [
    "First Name",
    "Last Name",
    "CLK ID",
    "Course Title",
    "Accreditation Number",
    "Completion Date",
  ];

  const escapeXml = (s: string) =>
    s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const cell = (v: string) =>
    `<Cell><Data ss:Type="String">${escapeXml(v)}</Data></Cell>`;

  const headerRow = `<Row>${header.map(cell).join("")}</Row>`;
  const body = rows
    .map(
      (r) =>
        `<Row>${[
          r.firstName,
          r.lastName,
          r.clkId,
          r.courseTitle,
          r.accreditationNumber,
          r.completionDate,
        ]
          .map(cell)
          .join("")}</Row>`
    )
    .join("");

  return `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Worksheet ss:Name="CLK Export">
  <Table>
   ${headerRow}
   ${body}
  </Table>
 </Worksheet>
</Workbook>`;
}

export async function assertPartnerReporterAccess(
  partnerInstitutionId: string,
  userId: string
): Promise<boolean> {
  const admin = createServiceRoleClient();

  const { data: user } = await admin
    .from("users")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (user?.role === "admin") return true;

  const { data: membership } = await admin
    .from("partner_institution_members")
    .select("id")
    .eq("partner_institution_id", partnerInstitutionId)
    .eq("user_id", userId)
    .maybeSingle();

  return Boolean(membership?.id);
}

export async function fetchPartnerCompletionRows(
  query: PartnerReportQuery
): Promise<ClkExportRow[]> {
  const admin = createServiceRoleClient();

  const { data: certs, error } = await admin
    .from("certificates")
    .select(
      `
      issued_at,
      clk_id,
      accreditation_number,
      physician_full_name,
      course_id,
      courses!inner ( title, accreditation_number ),
      users!inner ( first_name, last_name, full_name, clk_id )
    `
    )
    .eq("partner_institution_id", query.partnerInstitutionId)
    .gte("issued_at", query.from)
    .lt("issued_at", query.to)
    .order("issued_at", { ascending: true });

  if (error) {
    // Fallback without join aliases if FK names differ
    console.error("[academy-b2b] report join failed, using flat query", error.message);
    return fetchPartnerCompletionRowsFlat(query);
  }

  return (certs ?? []).map((row) => {
    const users = row.users as {
      first_name?: string | null;
      last_name?: string | null;
      full_name?: string | null;
      clk_id?: string | null;
    };
    const courses = row.courses as {
      title?: string;
      accreditation_number?: string | null;
    };

    let firstName = users?.first_name ?? "";
    let lastName = users?.last_name ?? "";
    if (!firstName && !lastName) {
      const split = splitFullName(row.physician_full_name ?? users?.full_name);
      firstName = split.firstName;
      lastName = split.lastName;
    }

    return {
      firstName,
      lastName,
      clkId: row.clk_id ?? users?.clk_id ?? "",
      courseTitle: courses?.title ?? "",
      accreditationNumber:
        row.accreditation_number ?? courses?.accreditation_number ?? "",
      completionDate: new Date(row.issued_at as string).toISOString().slice(0, 10),
    } satisfies ClkExportRow;
  });
}

async function fetchPartnerCompletionRowsFlat(
  query: PartnerReportQuery
): Promise<ClkExportRow[]> {
  const admin = createServiceRoleClient();

  const { data: certs, error } = await admin
    .from("certificates")
    .select(
      "issued_at, clk_id, accreditation_number, physician_full_name, course_id, user_id"
    )
    .eq("partner_institution_id", query.partnerInstitutionId)
    .gte("issued_at", query.from)
    .lt("issued_at", query.to)
    .order("issued_at", { ascending: true });

  if (error) throw new Error(error.message);

  const rows: ClkExportRow[] = [];
  for (const cert of certs ?? []) {
    const [{ data: user }, { data: course }] = await Promise.all([
      admin
        .from("users")
        .select("first_name, last_name, full_name, clk_id")
        .eq("id", cert.user_id)
        .maybeSingle(),
      admin
        .from("courses")
        .select("title, accreditation_number")
        .eq("id", cert.course_id)
        .maybeSingle(),
    ]);

    let firstName = user?.first_name ?? "";
    let lastName = user?.last_name ?? "";
    if (!firstName && !lastName) {
      const split = splitFullName(cert.physician_full_name ?? user?.full_name);
      firstName = split.firstName;
      lastName = split.lastName;
    }

    rows.push({
      firstName,
      lastName,
      clkId: cert.clk_id ?? user?.clk_id ?? "",
      courseTitle: course?.title ?? "",
      accreditationNumber:
        cert.accreditation_number ?? course?.accreditation_number ?? "",
      completionDate: new Date(cert.issued_at as string).toISOString().slice(0, 10),
    });
  }

  return rows;
}
