import { createServiceRoleClient } from "@/lib/supabase/service";
import type { CmeCertificate, CmeCertificatePdfData } from "@/types/academy-b2b";

function escapePdfText(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function formatDateCs(d: Date): string {
  return d.toLocaleDateString("cs-CZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function generateCertificateCode(): string {
  const year = new Date().getFullYear();
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `MSA-CME-${year}-${rand}`;
}

/**
 * Minimalist MedScope CME certificate PDF (Helvetica, single page).
 * Layout mirrors clean magazine aesthetic — no decorative clutter.
 */
export function generateCmeCertificatePdf(data: CmeCertificatePdfData): Buffer {
  const lines: Array<{ text: string; size: number; gap: number }> = [
    { text: "MedScope Academy", size: 11, gap: 18 },
    { text: "Certifikát o absolvování akreditovaného kurzu", size: 16, gap: 36 },
    { text: data.physicianFullName, size: 20, gap: 28 },
    { text: `ČLK ID: ${data.clkId}`, size: 12, gap: 22 },
    { text: data.courseTitle, size: 14, gap: 22 },
    { text: `Partner: ${data.partnerInstitutionName}`, size: 11, gap: 18 },
    { text: `Akreditace ČLK: ${data.accreditationNumber}`, size: 12, gap: 18 },
    { text: `Kredity: ${data.creditsEarned}`, size: 12, gap: 18 },
    { text: `Datum absolvování: ${formatDateCs(data.completionDate)}`, size: 12, gap: 22 },
    { text: `Kód certifikátu: ${data.certificateCode}`, size: 10, gap: 28 },
    { text: "medscopeglobal.com/academy", size: 9, gap: 14 },
  ];

  let y = 720;
  const contentLines: string[] = [];

  // Thin top rule
  contentLines.push("0.6 w 72 740 m 540 740 l S");

  for (const line of lines) {
    contentLines.push(
      `BT /F1 ${line.size} Tf 72 ${y} Td (${escapePdfText(line.text)}) Tj ET`
    );
    y -= line.gap;
  }

  contentLines.push("0.6 w 72 120 m 540 120 l S");
  contentLines.push(
    `BT /F1 8 Tf 72 100 Td (${escapePdfText(
      "Vydáno platformou MedScopeGlobal · Vzdělávání pro ověřené lékaře"
    )}) Tj ET`
  );

  const stream = contentLines.join("\n");
  const streamLen = Buffer.byteLength(stream, "utf8");

  const objects = [
    "1 0 obj<< /Type /Catalog /Pages 2 0 R >>endobj",
    "2 0 obj<< /Type /Pages /Kids [3 0 R] /Count 1 >>endobj",
    "3 0 obj<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>endobj",
    `4 0 obj<< /Length ${streamLen} >>stream\n${stream}\nendstream endobj`,
    "5 0 obj<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>endobj",
  ];

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [0];

  for (const obj of objects) {
    offsets.push(Buffer.byteLength(pdf, "utf8"));
    pdf += `${obj}\n`;
  }

  const xrefOffset = Buffer.byteLength(pdf, "utf8");
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (let i = 1; i <= objects.length; i += 1) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return Buffer.from(pdf, "utf8");
}

export async function issueCmeCertificate(input: {
  userId: string;
  courseId: string;
  quizId: string;
  score: number;
  physicianName: string;
  clkId: string;
}): Promise<CmeCertificate | null> {
  const admin = createServiceRoleClient();

  const { data: existing } = await admin
    .from("certificates")
    .select("*")
    .eq("user_id", input.userId)
    .eq("course_id", input.courseId)
    .maybeSingle();

  if (existing) return existing as CmeCertificate;

  const { data: course } = await admin
    .from("courses")
    .select(
      "id, title, accreditation_number, credits_count, partner_institution_id, passing_threshold"
    )
    .eq("id", input.courseId)
    .maybeSingle();

  if (!course) return null;

  let partnerName = "MedScope Partner";
  let partnerLogo: string | null = null;
  if (course.partner_institution_id) {
    const { data: partner } = await admin
      .from("partner_institutions")
      .select("name, logo_url")
      .eq("id", course.partner_institution_id)
      .maybeSingle();
    if (partner) {
      partnerName = partner.name;
      partnerLogo = partner.logo_url;
    }
  }

  const code = generateCertificateCode();
  const issuedAt = new Date();

  const pdf = generateCmeCertificatePdf({
    physicianFullName: input.physicianName,
    clkId: input.clkId,
    courseTitle: course.title as string,
    partnerInstitutionName: partnerName,
    partnerLogoUrl: partnerLogo,
    accreditationNumber: (course.accreditation_number as string) ?? "—",
    creditsEarned: (course.credits_count as number) ?? 0,
    completionDate: issuedAt,
    certificateCode: code,
  });

  // Optional storage — ignore failures so certification still succeeds
  let pdfPath: string | null = null;
  try {
    const path = `cme-certificates/${input.userId}/${code}.pdf`;
    const { error: uploadErr } = await admin.storage
      .from("certificates")
      .upload(path, pdf, { contentType: "application/pdf", upsert: true });
    if (!uploadErr) pdfPath = path;
  } catch {
    pdfPath = null;
  }

  const { data: cert, error } = await admin
    .from("certificates")
    .insert({
      user_id: input.userId,
      course_id: input.courseId,
      certificate_code: code,
      issued_at: issuedAt.toISOString(),
      clk_id: input.clkId,
      accreditation_number: course.accreditation_number ?? null,
      credits_earned: course.credits_count ?? 0,
      partner_institution_id: course.partner_institution_id ?? null,
      physician_full_name: input.physicianName,
      pdf_storage_path: pdfPath,
      metadata: {
        score: input.score,
        quiz_id: input.quizId,
        partner_name: partnerName,
        partner_logo_url: partnerLogo,
        kind: "cme_b2b",
      },
    })
    .select("*")
    .single();

  if (error) {
    console.error("[academy-b2b] issueCmeCertificate", error.message);
    return null;
  }

  return cert as CmeCertificate;
}

export async function buildCmeCertificatePdfById(
  certificateId: string
): Promise<{ pdf: Buffer; filename: string } | null> {
  const admin = createServiceRoleClient();
  const { data: cert } = await admin
    .from("certificates")
    .select("*")
    .eq("id", certificateId)
    .maybeSingle();

  if (!cert) return null;

  const { data: course } = await admin
    .from("courses")
    .select("title")
    .eq("id", cert.course_id)
    .maybeSingle();

  const meta = (cert.metadata ?? {}) as {
    partner_name?: string;
    partner_logo_url?: string | null;
  };

  const pdf = generateCmeCertificatePdf({
    physicianFullName: cert.physician_full_name ?? "Lékař",
    clkId: cert.clk_id ?? "—",
    courseTitle: course?.title ?? "Kurz MedScope Academy",
    partnerInstitutionName: meta.partner_name ?? "Partner",
    partnerLogoUrl: meta.partner_logo_url,
    accreditationNumber: cert.accreditation_number ?? "—",
    creditsEarned: cert.credits_earned ?? 0,
    completionDate: new Date(cert.issued_at),
    certificateCode: cert.certificate_code,
  });

  return {
    pdf,
    filename: `certifikat-cme-${cert.certificate_code}.pdf`,
  };
}
