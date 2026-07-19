/**
 * Minimal text PDF generator (no native deps — Vercel-safe).
 * Produces a single-page PDF with Helvetica text lines.
 */

function escapePdfText(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

export function buildSimpleTextPdf(lines: string[]): Buffer {
  const contentLines: string[] = ["BT", "/F1 11 Tf", "50 780 Td", "14 TL"];
  lines.forEach((line, i) => {
    const safe = escapePdfText(line.slice(0, 110));
    if (i === 0) contentLines.push(`(${safe}) Tj`);
    else contentLines.push(`T* (${safe}) Tj`);
  });
  contentLines.push("ET");
  const stream = contentLines.join("\n");

  const objects: string[] = [];
  objects.push("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");
  objects.push("2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n");
  objects.push(
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n"
  );
  objects.push(
    `4 0 obj\n<< /Length ${Buffer.byteLength(stream, "utf8")} >>\nstream\n${stream}\nendstream\nendobj\n`
  );
  objects.push("5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n");

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [0];
  for (const obj of objects) {
    offsets.push(Buffer.byteLength(pdf, "utf8"));
    pdf += obj;
  }
  const xrefStart = Buffer.byteLength(pdf, "utf8");
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (let i = 1; i <= objects.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
  return Buffer.from(pdf, "utf8");
}

export function invoiceHtmlToPdfBase64(params: {
  transactionId: string;
  issuedAtLabel: string;
  customerName: string;
  customerEmail: string;
  lineItems: { description: string; amountLabel: string }[];
  subtotalLabel: string;
  vatLabel: string;
  totalLabel: string;
}): string {
  const lines = [
    "MedScopeGlobal s.r.o. — Faktura",
    `Cislo: ${params.transactionId}`,
    `Datum: ${params.issuedAtLabel}`,
    `Odberatel: ${params.customerName}`,
    `Email: ${params.customerEmail}`,
    "",
    "Polozky:",
    ...params.lineItems.map((i) => `- ${i.description}: ${i.amountLabel}`),
    "",
    `Zaklad: ${params.subtotalLabel}`,
    `DPH: ${params.vatLabel}`,
    `Celkem: ${params.totalLabel}`,
    "",
    "info@medscopeglobal.com — https://medscopeglobal.com",
  ];
  return buildSimpleTextPdf(lines).toString("base64");
}
