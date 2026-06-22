/** Minimal PDF certificate generator — no external deps. */

export type CertificateData = {
  recipientName: string;
  courseTitle: string;
  certificateCode: string;
  issuedAt: Date;
  score?: number;
};

function escapePdfText(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("cs-CZ", { day: "numeric", month: "long", year: "numeric" });
}

/** Build a valid single-page PDF with certificate text. */
export function generateCertificatePdf(data: CertificateData): Buffer {
  const lines = [
    "MedScope Academy",
    "Certifikát o absolvování kurzu",
    "",
    data.recipientName,
    `kurz: ${data.courseTitle}`,
    data.score != null ? `skóre kvízu: ${data.score}%` : "",
    `vydáno: ${formatDate(data.issuedAt)}`,
    `kód: ${data.certificateCode}`,
    "",
    "medscopeglobal.com/academy",
  ].filter(Boolean);

  const fontSize = 14;
  const titleSize = 22;
  let y = 750;
  const contentLines: string[] = [];

  contentLines.push(`BT /F1 ${titleSize} Tf 72 ${y} Td (${escapePdfText(lines[0])}) Tj ET`);
  y -= 40;
  contentLines.push(`BT /F1 ${fontSize} Tf 72 ${y} Td (${escapePdfText(lines[1])}) Tj ET`);
  y -= 50;

  for (let i = 2; i < lines.length; i++) {
    const size = i === 3 ? 18 : fontSize;
    y -= i === 3 ? 36 : 24;
    contentLines.push(`BT /F1 ${size} Tf 72 ${y} Td (${escapePdfText(lines[i])}) Tj ET`);
  }

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
    pdf += obj + "\n";
  }

  const xrefOffset = Buffer.byteLength(pdf, "utf8");
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (let i = 1; i <= objects.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return Buffer.from(pdf, "utf8");
}

export function generateCertificateCode(): string {
  const year = new Date().getFullYear();
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `MSA-${year}-${rand}`;
}
