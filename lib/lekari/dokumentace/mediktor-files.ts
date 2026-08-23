/**
 * MeDiktor file exports:
 * - .docx (OOXML zip — Word / LibreOffice)
 * - .pdf  (PDF-1.4, Times + Times-Bold, Czech via WinAnsi + composed carons)
 */
import JSZip from "jszip";
import {
  ANAMNESIS_BRAND,
  ANAMNESIS_DOCUMENT_TITLE,
  ANAMNESIS_FOOTER,
  ANAMNESIS_KICKER,
  buildAnamnesisExportDocument,
  looksLikeAnamnesisNote,
  parseAnamnesisFromNote,
  renderAnamnesisReport,
  stripAnamnesisMachineBlock,
  type AnamnesisExportDocument,
  type AnamnesisExportRow,
  type AnamnesisExportSection,
  type YesNoUnknown,
} from "@/lib/lekari/dokumentace/anamnesis";

export const DOCX_MIME =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
export const PDF_MIME = "application/pdf";
export const TXT_MIME = "text/plain;charset=utf-8";

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function exportPlainLines(note: string, title: string): string[] {
  const visible = stripAnamnesisMachineBlock(note);
  const body = looksLikeAnamnesisNote(note)
    ? stripAnamnesisMachineBlock(renderAnamnesisReport(parseAnamnesisFromNote(note)))
    : visible;
  const lines = [title.trim() || "MeDiktor zápis", "", ...body.split(/\r?\n/)];
  return lines
    .map((l) => l.replace(/\u0000/g, ""))
    .filter((l, i, arr) => !(l === "" && arr[i - 1] === ""))
    .filter((l) => !l.includes("MEDIKTOR_ANAMNESIS_JSON") && !l.includes("<<<MEDIKTOR"));
}

/** UTF-8 plain text — most reliable open-on-mobile fallback. */
export function buildMediktorTxtBytes(note: string, title = "MeDiktor zápis"): Uint8Array {
  const text = exportPlainLines(note, title).join("\n");
  // UTF-8 without BOM — BOM sometimes confuses mobile text viewers as binary
  return new TextEncoder().encode(text.endsWith("\n") ? text : `${text}\n`);
}

function resolveExport(note: string, title: string): AnamnesisExportDocument | { plain: string[] } {
  if (looksLikeAnamnesisNote(note)) {
    return buildAnamnesisExportDocument(parseAnamnesisFromNote(note), {
      title: title.trim() || ANAMNESIS_DOCUMENT_TITLE,
    });
  }
  return { plain: exportPlainLines(note, title) };
}

function ynMark(value: YesNoUnknown): string {
  const box = (on: boolean) => (on ? "☑" : "☐");
  return `${box(value === "ano")} Ano    ${box(value === "ne")} Ne    ${box(value !== "ano" && value !== "ne")} Neuvedeno`;
}

function ticksMark(row: Extract<AnamnesisExportRow, { kind: "ticks" }>): string {
  const boxes = row.items.map((i) => `${i.on ? "☑" : "☐"} ${i.label}`).join("    ");
  return row.extra ? `${boxes} — ${row.extra}` : boxes;
}

/* ---------------- Word ---------------- */

function wRun(text: string, opts?: { bold?: boolean; size?: number; color?: string; italic?: boolean }): string {
  const size = String(opts?.size ?? 21);
  const color = opts?.color ? `<w:color w:val="${opts.color}"/>` : "";
  const bold = opts?.bold ? "<w:b/>" : "";
  const italic = opts?.italic ? "<w:i/>" : "";
  return `<w:r><w:rPr>${bold}${italic}<w:sz w:val="${size}"/><w:szCs w:val="${size}"/>${color}<w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/></w:rPr><w:t xml:space="preserve">${xmlEscape(text)}</w:t></w:r>`;
}

function wP(runs: string, extraPr = ""): string {
  return `<w:p><w:pPr>${extraPr}<w:spacing w:after="60"/></w:pPr>${runs}</w:p>`;
}

function wCell(text: string, width: number, opts?: { shade?: string; bold?: boolean }): string {
  const shade = opts?.shade ? `<w:shd w:val="clear" w:color="auto" w:fill="${opts.shade}"/>` : "";
  return `<w:tc><w:tcPr><w:tcW w:w="${width}" w:type="dxa"/>${shade}<w:tcBorders><w:bottom w:val="single" w:sz="4" w:color="E6EEF4"/></w:tcBorders></w:tcPr>${wP(wRun(text, { bold: opts?.bold, size: 20, color: opts?.bold ? "2A3A48" : "1A2430" }))}</w:tc>`;
}

function wRow(label: string, value: string): string {
  return `<w:tr>${wCell(label, 3400, { shade: "F7FAFC", bold: true })}${wCell(value, 5966)}</w:tr>`;
}

function wTable(rows: string): string {
  return `<w:tbl><w:tblPr><w:tblW w:w="5000" w:type="pct"/><w:tblBorders><w:top w:val="single" w:sz="4" w:color="D5E3EE"/><w:left w:val="single" w:sz="4" w:color="D5E3EE"/><w:bottom w:val="single" w:sz="4" w:color="D5E3EE"/><w:right w:val="single" w:sz="4" w:color="D5E3EE"/></w:tblBorders></w:tblPr><w:tblGrid><w:gridCol w:w="3400"/><w:gridCol w:w="5966"/></w:tblGrid>${rows}</w:tbl>`;
}

function wordSection(section: AnamnesisExportSection): string {
  const heading = wP(
    wRun(section.title, { bold: true, size: 23, color: "021D33" }),
    `<w:pStyle w:val="Heading2"/><w:shd w:val="clear" w:color="auto" w:fill="E8F1F8"/><w:spacing w:before="200" w:after="80"/>`
  );
  const rows = section.rows
    .map((row) => {
      if (row.kind === "text") return wRow(row.label, row.value);
      if (row.kind === "yn") return wRow(row.label, ynMark(row.value));
      if (row.kind === "ticks") return wRow(row.label, ticksMark(row));
      if (row.kind === "para") return wRow("", row.text);
      return row.lines.map((line) => wRow(line, "........................................")).join("");
    })
    .join("");
  return heading + wTable(rows);
}

function wordHeaderXml(brand: string): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:hdr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:p><w:pPr><w:shd w:val="clear" w:color="auto" w:fill="021D33"/><w:spacing w:after="0"/></w:pPr>${wRun(brand, { size: 18, color: "FFFFFF" })}</w:p>
</w:hdr>`;
}

function wordFooterXml(footer: string): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:p><w:pPr><w:spacing w:before="80"/></w:pPr>${wRun(footer + "  ·  Strana ", { size: 16, color: "5A6570" })}<w:r><w:rPr><w:sz w:val="16"/><w:color w:val="5A6570"/></w:rPr><w:fldChar w:fldCharType="begin"/></w:r><w:r><w:rPr><w:sz w:val="16"/><w:color w:val="5A6570"/></w:rPr><w:instrText xml:space="preserve"> PAGE </w:instrText></w:r><w:r><w:rPr><w:sz w:val="16"/><w:color w:val="5A6570"/></w:rPr><w:fldChar w:fldCharType="end"/></w:r>${wRun(" / ", { size: 16, color: "5A6570" })}<w:r><w:rPr><w:sz w:val="16"/><w:color w:val="5A6570"/></w:rPr><w:fldChar w:fldCharType="begin"/></w:r><w:r><w:rPr><w:sz w:val="16"/><w:color w:val="5A6570"/></w:rPr><w:instrText xml:space="preserve"> NUMPAGES </w:instrText></w:r><w:r><w:rPr><w:sz w:val="16"/><w:color w:val="5A6570"/></w:rPr><w:fldChar w:fldCharType="end"/></w:r></w:p>
</w:ftr>`;
}

export async function buildMediktorDocxBytes(
  note: string,
  title = "MeDiktor zápis"
): Promise<Uint8Array> {
  const resolved = resolveExport(note, title);
  let body: string;
  let brand = ANAMNESIS_BRAND;
  let footer = ANAMNESIS_FOOTER;
  let docTitle = title.trim() || "MeDiktor zápis";

  if ("plain" in resolved) {
    body = resolved.plain
      .map((line) => {
        if (!line) return wP("");
        const heading = /^ANAMNESTICKÝ|\d+\.\s+\S/.test(line) && line.length < 120;
        return wP(wRun(line, { bold: heading, size: heading ? 24 : 21, color: heading ? "021D33" : "1A2430" }));
      })
      .join("");
  } else {
    brand = resolved.brand;
    footer = resolved.footer;
    docTitle = resolved.title;
    body =
      wP(wRun(docTitle, { bold: true, size: 32, color: "021D33" }), `<w:jc w:val="center"/><w:spacing w:after="80"/>`) +
      wP(wRun(resolved.kicker, { italic: true, size: 18, color: "4A5560" }), `<w:jc w:val="center"/><w:spacing w:after="200"/>`) +
      resolved.sections.map(wordSection).join("");
  }

  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:body>
    ${body}
    <w:sectPr>
      <w:headerReference w:type="default" r:id="rId2"/>
      <w:footerReference w:type="default" r:id="rId3"/>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="1418" w:right="1134" w:bottom="1418" w:left="1134" w:header="568" w:footer="708"/>
    </w:sectPr>
  </w:body>
</w:document>`;

  const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:style w:type="paragraph" w:styleId="Normal" w:default="1">
    <w:name w:val="Normal"/>
    <w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="21"/><w:color w:val="1A2430"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading1">
    <w:name w:val="heading 1"/><w:basedOn w:val="Normal"/>
    <w:pPr><w:spacing w:before="160" w:after="80"/></w:pPr>
    <w:rPr><w:b/><w:sz w:val="32"/><w:color w:val="021D33"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading2">
    <w:name w:val="heading 2"/><w:basedOn w:val="Normal"/>
    <w:pPr><w:spacing w:before="200" w:after="80"/></w:pPr>
    <w:rPr><w:b/><w:sz w:val="23"/><w:color w:val="021D33"/></w:rPr>
  </w:style>
</w:styles>`;

  const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
  <Override PartName="/word/header1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml"/>
  <Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/>
</Types>`;

  const rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

  const docRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/header" Target="header1.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer1.xml"/>
</Relationships>`;

  const zip = new JSZip();
  zip.file("[Content_Types].xml", contentTypes);
  zip.folder("_rels")?.file(".rels", rels);
  const word = zip.folder("word");
  word?.file("document.xml", documentXml);
  word?.file("styles.xml", stylesXml);
  word?.file("header1.xml", wordHeaderXml(brand));
  word?.file("footer1.xml", wordFooterXml(footer));
  word?.folder("_rels")?.file("document.xml.rels", docRels);

  return zip.generateAsync({
    type: "uint8array",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });
}

/* ---------------- PDF ---------------- */

const WINANSI: Record<number, number> = {
  0x20ac: 0x80, 0x201a: 0x82, 0x0192: 0x83, 0x201e: 0x84, 0x2026: 0x85,
  0x2020: 0x86, 0x2021: 0x87, 0x02c6: 0x88, 0x2030: 0x89, 0x0160: 0x8a,
  0x2039: 0x8b, 0x0152: 0x8c, 0x017d: 0x8e, 0x2018: 0x91, 0x2019: 0x92,
  0x201c: 0x93, 0x201d: 0x94, 0x2022: 0x95, 0x2013: 0x96, 0x2014: 0x97,
  0x02dc: 0x98, 0x2122: 0x99, 0x0161: 0x9a, 0x203a: 0x9b, 0x0153: 0x9c,
  0x017e: 0x9e, 0x0178: 0x9f,
};

function winAnsiByte(ch: string): number | null {
  const cp = ch.codePointAt(0) ?? 0;
  if (cp === 9 || cp === 10 || cp === 13) return 32;
  if (cp >= 32 && cp <= 126) return cp;
  if (cp >= 160 && cp <= 255) return cp;
  return WINANSI[cp] ?? null;
}

type AccentKind = "caron" | "ring" | "acute";
const COMPOSE: Record<string, { base: string; kind: AccentKind }> = {
  č: { base: "c", kind: "caron" }, Č: { base: "C", kind: "caron" },
  ď: { base: "d", kind: "caron" }, Ď: { base: "D", kind: "caron" },
  ě: { base: "e", kind: "caron" }, Ě: { base: "E", kind: "caron" },
  ň: { base: "n", kind: "caron" }, Ň: { base: "N", kind: "caron" },
  ř: { base: "r", kind: "caron" }, Ř: { base: "R", kind: "caron" },
  š: { base: "s", kind: "caron" }, Š: { base: "S", kind: "caron" },
  ť: { base: "t", kind: "caron" }, Ť: { base: "T", kind: "caron" },
  ž: { base: "z", kind: "caron" }, Ž: { base: "Z", kind: "caron" },
  ů: { base: "u", kind: "ring" }, Ů: { base: "U", kind: "ring" },
};

function pdfLiteralFromWinAnsi(text: string): string {
  let out = "(";
  for (const ch of text) {
    const b = winAnsiByte(ch);
    if (b == null) continue;
    if (b === 0x28 || b === 0x29 || b === 0x5c) out += `\\${String.fromCharCode(b)}`;
    else if (b < 32 || b > 126) out += `\\${b.toString(8).padStart(3, "0")}`;
    else out += String.fromCharCode(b);
  }
  return `${out})`;
}

function wrapLine(line: string, max = 88): string[] {
  if (line.length <= max) return [line];
  const out: string[] = [];
  let rest = line;
  while (rest.length > max) {
    let cut = rest.lastIndexOf(" ", max);
    if (cut < 24) cut = max;
    out.push(rest.slice(0, cut));
    rest = rest.slice(cut).trimStart();
  }
  if (rest) out.push(rest);
  return out;
}

function accentOps(kind: AccentKind, x: number, y: number, size: number): string {
  const w = size * 0.4;
  if (kind === "caron") {
    const y0 = y + size * 0.74;
    return `${(x + size * 0.06).toFixed(1)} ${y0.toFixed(1)} m ${(x + w * 0.5).toFixed(1)} ${(y0 + size * 0.16).toFixed(1)} l ${(x + w).toFixed(1)} ${y0.toFixed(1)} l S`;
  }
  if (kind === "ring") {
    const cx = x + size * 0.2;
    const cy = y + size * 0.84;
    const r = size * 0.09;
    return `${(cx + r).toFixed(1)} ${cy.toFixed(1)} m ${(cx + r).toFixed(1)} ${(cy + r * 0.55).toFixed(1)} ${(cx + r * 0.55).toFixed(1)} ${(cy + r).toFixed(1)} ${cx.toFixed(1)} ${(cy + r).toFixed(1)} c ${(cx - r * 0.55).toFixed(1)} ${(cy + r).toFixed(1)} ${(cx - r).toFixed(1)} ${(cy + r * 0.55).toFixed(1)} ${(cx - r).toFixed(1)} ${cy.toFixed(1)} c ${(cx - r).toFixed(1)} ${(cy - r * 0.55).toFixed(1)} ${(cx - r * 0.55).toFixed(1)} ${(cy - r).toFixed(1)} ${cx.toFixed(1)} ${(cy - r).toFixed(1)} c ${(cx + r * 0.55).toFixed(1)} ${(cy - r).toFixed(1)} ${(cx + r).toFixed(1)} ${(cy - r * 0.55).toFixed(1)} ${(cx + r).toFixed(1)} ${cy.toFixed(1)} c S`;
  }
  const y0 = y + size * 0.8;
  return `${(x + size * 0.16).toFixed(1)} ${y0.toFixed(1)} m ${(x + size * 0.26).toFixed(1)} ${(y0 + size * 0.14).toFixed(1)} l S`;
}

const NAVY = "0.008 0.114 0.200";
const WASH = "0.910 0.945 0.973";
const RULE = "0.773 0.839 0.894";
const INK = "0.102 0.141 0.188";
const MUTED = "0.353 0.396 0.439";
const WHITE = "1 1 1";
const PAGE_W = 595;
const PAGE_H = 842;
const MARGIN = 48;

function drawText(
  text: string,
  x0: number,
  y: number,
  size: number,
  font: "F1" | "F2",
  fill: string
): string {
  const ops: string[] = [`${fill} rg`, `${fill} RG`];
  let x = x0;
  let buf = "";
  const flush = () => {
    if (!buf) return;
    ops.push(`BT /${font} ${size} Tf ${x.toFixed(1)} ${y.toFixed(1)} Td ${pdfLiteralFromWinAnsi(buf)} Tj ET`);
    x += buf.length * size * 0.48;
    buf = "";
  };
  for (const ch of text) {
    if (ch === "☑" || ch === "☐") {
      flush();
      const on = ch === "☑";
      ops.push(`${NAVY} RG 0.7 w ${x.toFixed(1)} ${(y - 1).toFixed(1)} 7.2 7.2 re S`);
      if (on) ops.push(`${NAVY} rg ${(x + 1.6).toFixed(1)} ${(y + 0.6).toFixed(1)} 4 4 re f`);
      x += size * 0.95;
      continue;
    }
    const compose = COMPOSE[ch];
    if (compose) {
      flush();
      ops.push(`${fill} rg`);
      ops.push(`BT /${font} ${size} Tf ${x.toFixed(1)} ${y.toFixed(1)} Td ${pdfLiteralFromWinAnsi(compose.base)} Tj ET`);
      ops.push(`${fill} RG 0.7 w`);
      ops.push(accentOps(compose.kind, x, y, size));
      x += size * 0.48;
      continue;
    }
    if (winAnsiByte(ch) == null) {
      buf += ch === "—" || ch === "–" ? "-" : ch === "„" || ch === "“" || ch === "”" ? '"' : " ";
      continue;
    }
    buf += ch;
  }
  flush();
  return ops.join("\n");
}

function utf8Bytes(text: string): Uint8Array {
  return new TextEncoder().encode(text);
}

function concatBytes(chunks: Uint8Array[]): Uint8Array {
  const total = chunks.reduce((n, c) => n + c.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const c of chunks) {
    out.set(c, offset);
    offset += c.length;
  }
  return out;
}

function estimateSectionHeight(section: AnamnesisExportSection): number {
  let h = 26;
  for (const row of section.rows) {
    if (row.kind === "para") h += 12 * wrapLine(row.text, 86).length + 8;
    else if (row.kind === "sign") h += 20 * row.lines.length;
    else if (row.kind === "text") h += 13 * wrapLine(row.value, 52).length;
    else h += 16;
  }
  return h + 6;
}

export type MediktorPdfChrome = {
  brand?: string;
  chromeTitle?: string;
  kicker?: string;
  footer?: string;
};

function paintChrome(
  pageIndex: number,
  pageCount: number,
  brand: string,
  footer: string,
  chromeTitle = ANAMNESIS_DOCUMENT_TITLE,
): string[] {
  const ops: string[] = [];
  ops.push(`${NAVY} rg 0 ${PAGE_H - 46} ${PAGE_W} 46 re f`);
  ops.push(drawText(brand, MARGIN, PAGE_H - 18, 8, "F1", WHITE));
  ops.push(drawText(chromeTitle, MARGIN, PAGE_H - 34, 12, "F2", WHITE));
  ops.push(`${RULE} RG 0.6 w ${MARGIN} 40 m ${PAGE_W - MARGIN} 40 l S`);
  ops.push(drawText(footer, MARGIN, 28, 7, "F1", MUTED));
  ops.push(drawText(`Strana ${pageIndex + 1} / ${pageCount}`, PAGE_W - MARGIN - 70, 28, 7, "F1", MUTED));
  return ops;
}

function paintRow(row: AnamnesisExportRow, y: number, ops: string[]): number {
  const labelX = MARGIN + 6;
  const valueX = MARGIN + 188;
  const valueW = PAGE_W - MARGIN - valueX;
  if (row.kind === "para") {
    const lines = wrapLine(row.text, 86);
    for (const line of lines) {
      ops.push(drawText(line, labelX, y, 9, "F1", INK));
      y -= 12;
    }
    return y - 4;
  }
  if (row.kind === "sign") {
    for (const line of row.lines) {
      ops.push(drawText(line, labelX, y, 10, "F1", INK));
      ops.push(`${NAVY} RG 0.6 w ${valueX} ${y - 1} m ${PAGE_W - MARGIN} ${y - 1} l S`);
      y -= 20;
    }
    return y;
  }
  const value =
    row.kind === "text" ? row.value : row.kind === "yn" ? ynMark(row.value) : ticksMark(row);
  const valueLines = wrapLine(value, Math.floor(valueW / 5.2));
  ops.push(`${WASH} rg ${MARGIN} ${y - 4} 180 ${12 * valueLines.length + 6} re f`);
  ops.push(drawText(row.label, labelX, y, 8, "F2", MUTED));
  for (let i = 0; i < valueLines.length; i++) {
    ops.push(drawText(valueLines[i], valueX, y - i * 12, 10, "F1", INK));
  }
  y -= 12 * valueLines.length;
  ops.push(`${RULE} RG 0.4 w ${MARGIN} ${y - 3} m ${PAGE_W - MARGIN} ${y - 3} l S`);
  return y - 10;
}

function paintSection(section: AnamnesisExportSection, y: number, ops: string[]): number {
  ops.push(`${WASH} rg ${MARGIN} ${y - 6} ${PAGE_W - MARGIN * 2} 20 re f`);
  ops.push(`${NAVY} rg ${MARGIN} ${y - 6} 3 20 re f`);
  ops.push(drawText(section.title, MARGIN + 10, y, 11, "F2", NAVY));
  y -= 22;
  for (const row of section.rows) y = paintRow(row, y, ops);
  return y - 8;
}

export function buildMediktorPdfBytes(
  note: string,
  title = "MeDiktor zápis",
  chrome?: MediktorPdfChrome,
): Uint8Array {
  const resolved = resolveExport(note, title);
  const brand = chrome?.brand || ("plain" in resolved ? ANAMNESIS_BRAND : resolved.brand);
  const footer = chrome?.footer || ("plain" in resolved ? ANAMNESIS_FOOTER : resolved.footer);
  const kicker = chrome?.kicker || ("plain" in resolved ? ANAMNESIS_KICKER : resolved.kicker);
  const chromeTitle = chrome?.chromeTitle || ANAMNESIS_DOCUMENT_TITLE;

  type PageOps = string[];
  const pages: PageOps[] = [];
  let ops: string[] = [];
  let y = PAGE_H - 64;

  const newPage = () => {
    if (ops.length) pages.push(ops);
    ops = [];
    y = PAGE_H - 64;
  };

  newPage();
  const introTitle = "plain" in resolved ? title : resolved.title;
  ops.push(drawText(introTitle, MARGIN, y, 11, "F2", NAVY));
  y -= 16;
  for (const line of wrapLine(kicker, 92)) {
    ops.push(drawText(line, MARGIN, y, 8, "F1", MUTED));
    y -= 11;
  }
  y -= 8;

  if ("plain" in resolved) {
    for (const line of resolved.plain) {
      if (y < 64) newPage();
      const heading = /^\d+\.\s+\S/.test(line) && line.length < 120;
      if (heading) {
        ops.push(`${WASH} rg ${MARGIN} ${y - 6} ${PAGE_W - MARGIN * 2} 18 re f`);
        ops.push(drawText(line, MARGIN + 8, y, 11, "F2", NAVY));
        y -= 20;
      } else {
        for (const part of wrapLine(line, 92)) {
          if (y < 64) newPage();
          ops.push(drawText(part, MARGIN, y, 10, "F1", INK));
          y -= 13;
        }
      }
    }
  } else {
    for (const section of resolved.sections) {
      if (y - Math.min(estimateSectionHeight(section), 120) < 58) newPage();
      y = paintSection(section, y, ops);
    }
  }
  if (ops.length) pages.push(ops);

  const stamped = pages.map((content, i) =>
    [...paintChrome(i, pages.length, brand, footer, chromeTitle), ...content].join("\n")
  );

  const objects: string[] = [];
  objects.push("1 0 obj<< /Type /Catalog /Pages 2 0 R >>endobj");
  const pageIds = stamped.map((_, i) => 3 + i);
  const fontRoman = 3 + stamped.length * 2;
  const fontBold = fontRoman + 1;
  objects.push(
    `2 0 obj<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${stamped.length} >>endobj`
  );
  stamped.forEach((_, i) => {
    const pageId = 3 + i;
    const contentId = 3 + stamped.length + i;
    objects.push(
      `${pageId} 0 obj<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] /Contents ${contentId} 0 R /Resources << /Font << /F1 ${fontRoman} 0 R /F2 ${fontBold} 0 R >> >> >>endobj`
    );
  });
  stamped.forEach((stream, i) => {
    const contentId = 3 + stamped.length + i;
    const payload = `${stream}\n`;
    objects.push(`${contentId} 0 obj<< /Length ${utf8Bytes(payload).length} >>\nstream\n${payload}endstream\nendobj`);
  });
  objects.push(
    `${fontRoman} 0 obj<< /Type /Font /Subtype /Type1 /BaseFont /Times-Roman /Encoding /WinAnsiEncoding >>endobj`
  );
  objects.push(
    `${fontBold} 0 obj<< /Type /Font /Subtype /Type1 /BaseFont /Times-Bold /Encoding /WinAnsiEncoding >>endobj`
  );

  // Binary comment must be raw high bytes (not UTF-8-encoded Latin-1 via TextEncoder).
  const chunks: Uint8Array[] = [];
  const offsets = [0];
  let sizeSoFar = 0;
  const pushBytes = (buf: Uint8Array) => {
    chunks.push(buf);
    sizeSoFar += buf.length;
  };
  const push = (s: string) => pushBytes(utf8Bytes(s));
  push("%PDF-1.4\n%");
  pushBytes(new Uint8Array([0xe2, 0xe3, 0xcf, 0xd3, 0x0a]));
  for (const obj of objects) {
    offsets.push(sizeSoFar);
    push(`${obj}\n`);
  }
  const xrefOffset = sizeSoFar;
  let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i < offsets.length; i++) {
    xref += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  push(xref);
  push(`trailer<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`);
  return concatBytes(chunks);
}

export function looksLikeDocx(bytes: Uint8Array): boolean {
  return bytes.length > 4 && bytes[0] === 0x50 && bytes[1] === 0x4b;
}

export function looksLikePdf(bytes: Uint8Array): boolean {
  if (bytes.length < 5) return false;
  return (
    bytes[0] === 0x25 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x44 &&
    bytes[3] === 0x46 &&
    bytes[4] === 0x2d
  );
}
