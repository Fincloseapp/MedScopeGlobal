/**
 * MeDiktor file exports:
 * - .docx (OOXML zip — Word / LibreOffice)
 * - .pdf  (pdf-lib + embedded DejaVu Serif Latin/Latin-Ext subset — real Czech Unicode)
 */
import fontkit from "@pdf-lib/fontkit";
import JSZip from "jszip";
import { PDFDocument, rgb, type PDFFont, type PDFPage, type RGB } from "pdf-lib";
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
import serifBoldB64 from "@/lib/lekari/dokumentace/fonts/mediktor-serif-bold.b64";
import serifB64 from "@/lib/lekari/dokumentace/fonts/mediktor-serif.b64";

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

/* ---------------- PDF (Unicode via embedded DejaVu Serif subset) ---------------- */

const PAGE_W = 595;
const PAGE_H = 842;
const MARGIN = 48;
const NAVY = rgb(0.008, 0.114, 0.2);
const WASH = rgb(0.91, 0.945, 0.973);
const RULE = rgb(0.773, 0.839, 0.894);
const INK = rgb(0.102, 0.141, 0.188);
const MUTED = rgb(0.353, 0.396, 0.439);
const WHITE = rgb(1, 1, 1);

function b64ToBytes(b64: string): Uint8Array {
  if (typeof Buffer !== "undefined") {
    return new Uint8Array(Buffer.from(b64, "base64"));
  }
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
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

type PdfPaint = {
  page: PDFPage;
  font: PDFFont;
  fontBold: PDFFont;
};

function drawPdfText(
  paint: PdfPaint,
  text: string,
  x: number,
  y: number,
  size: number,
  bold: boolean,
  color: RGB
) {
  const font = bold ? paint.fontBold : paint.font;
  // pdf-lib rejects unknown glyphs; drop rare symbols rather than crash export.
  let safe = "";
  for (const ch of text) {
    try {
      font.widthOfTextAtSize(ch, size);
      safe += ch;
    } catch {
      safe += ch === "—" || ch === "–" ? "-" : " ";
    }
  }
  if (!safe) return;
  paint.page.drawText(safe, { x, y, size, font, color });
}

function paintChrome(
  paint: PdfPaint,
  pageIndex: number,
  pageCount: number,
  brand: string,
  footer: string,
  chromeTitle: string
) {
  const { page } = paint;
  page.drawRectangle({ x: 0, y: PAGE_H - 46, width: PAGE_W, height: 46, color: NAVY });
  drawPdfText(paint, brand, MARGIN, PAGE_H - 22, 8, false, WHITE);
  drawPdfText(paint, chromeTitle, MARGIN, PAGE_H - 38, 12, true, WHITE);
  page.drawLine({
    start: { x: MARGIN, y: 40 },
    end: { x: PAGE_W - MARGIN, y: 40 },
    thickness: 0.6,
    color: RULE,
  });
  drawPdfText(paint, footer, MARGIN, 28, 7, false, MUTED);
  drawPdfText(paint, `Strana ${pageIndex + 1} / ${pageCount}`, PAGE_W - MARGIN - 70, 28, 7, false, MUTED);
}

function paintRow(paint: PdfPaint, row: AnamnesisExportRow, y: number): number {
  const labelX = MARGIN + 6;
  const valueX = MARGIN + 188;
  const valueW = PAGE_W - MARGIN - valueX;
  if (row.kind === "para") {
    for (const line of wrapLine(row.text, 86)) {
      drawPdfText(paint, line, labelX, y, 9, false, INK);
      y -= 12;
    }
    return y - 4;
  }
  if (row.kind === "sign") {
    for (const line of row.lines) {
      drawPdfText(paint, line, labelX, y, 10, false, INK);
      paint.page.drawLine({
        start: { x: valueX, y: y - 1 },
        end: { x: PAGE_W - MARGIN, y: y - 1 },
        thickness: 0.6,
        color: NAVY,
      });
      y -= 20;
    }
    return y;
  }
  const value =
    row.kind === "text" ? row.value : row.kind === "yn" ? ynMark(row.value) : ticksMark(row);
  const valueLines = wrapLine(value, Math.floor(valueW / 5.2));
  paint.page.drawRectangle({
    x: MARGIN,
    y: y - 4,
    width: 180,
    height: 12 * valueLines.length + 6,
    color: WASH,
  });
  drawPdfText(paint, row.label, labelX, y, 8, true, MUTED);
  for (let i = 0; i < valueLines.length; i++) {
    drawPdfText(paint, valueLines[i], valueX, y - i * 12, 10, false, INK);
  }
  y -= 12 * valueLines.length;
  paint.page.drawLine({
    start: { x: MARGIN, y: y - 3 },
    end: { x: PAGE_W - MARGIN, y: y - 3 },
    thickness: 0.4,
    color: RULE,
  });
  return y - 10;
}

function paintSection(paint: PdfPaint, section: AnamnesisExportSection, y: number): number {
  paint.page.drawRectangle({
    x: MARGIN,
    y: y - 6,
    width: PAGE_W - MARGIN * 2,
    height: 20,
    color: WASH,
  });
  paint.page.drawRectangle({ x: MARGIN, y: y - 6, width: 3, height: 20, color: NAVY });
  drawPdfText(paint, section.title, MARGIN + 10, y, 11, true, NAVY);
  y -= 22;
  for (const row of section.rows) y = paintRow(paint, row, y);
  return y - 8;
}

export async function buildMediktorPdfBytes(
  note: string,
  title = "MeDiktor zápis",
  chrome?: MediktorPdfChrome
): Promise<Uint8Array> {
  const resolved = resolveExport(note, title);
  const brand = chrome?.brand || ("plain" in resolved ? ANAMNESIS_BRAND : resolved.brand);
  const footer = chrome?.footer || ("plain" in resolved ? ANAMNESIS_FOOTER : resolved.footer);
  const kicker = chrome?.kicker || ("plain" in resolved ? ANAMNESIS_KICKER : resolved.kicker);
  const chromeTitle = chrome?.chromeTitle || ANAMNESIS_DOCUMENT_TITLE;
  const introTitle = "plain" in resolved ? title : resolved.title;

  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);
  const font = await pdfDoc.embedFont(b64ToBytes(serifB64), { subset: true });
  const fontBold = await pdfDoc.embedFont(b64ToBytes(serifBoldB64), { subset: true });

  const pages: PDFPage[] = [];
  let page = pdfDoc.addPage([PAGE_W, PAGE_H]);
  pages.push(page);
  let paint: PdfPaint = { page, font, fontBold };
  let y = PAGE_H - 64;

  const newPage = () => {
    page = pdfDoc.addPage([PAGE_W, PAGE_H]);
    pages.push(page);
    paint = { page, font, fontBold };
    y = PAGE_H - 64;
  };

  drawPdfText(paint, introTitle, MARGIN, y, 11, true, NAVY);
  y -= 16;
  for (const line of wrapLine(kicker, 92)) {
    drawPdfText(paint, line, MARGIN, y, 8, false, MUTED);
    y -= 11;
  }
  y -= 8;

  if ("plain" in resolved) {
    for (const line of resolved.plain) {
      if (y < 64) newPage();
      const heading = /^\d+\.\s+\S/.test(line) && line.length < 120;
      if (heading) {
        page.drawRectangle({
          x: MARGIN,
          y: y - 6,
          width: PAGE_W - MARGIN * 2,
          height: 18,
          color: WASH,
        });
        drawPdfText(paint, line, MARGIN + 8, y, 11, true, NAVY);
        y -= 20;
      } else {
        for (const part of wrapLine(line, 92)) {
          if (y < 64) newPage();
          drawPdfText(paint, part, MARGIN, y, 10, false, INK);
          y -= 13;
        }
      }
    }
  } else {
    for (const section of resolved.sections) {
      if (y - Math.min(estimateSectionHeight(section), 120) < 58) newPage();
      y = paintSection(paint, section, y);
    }
  }

  const pageCount = pages.length;
  for (let i = 0; i < pages.length; i++) {
    paintChrome({ page: pages[i], font, fontBold }, i, pageCount, brand, footer, chromeTitle);
  }

  return pdfDoc.save();
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
