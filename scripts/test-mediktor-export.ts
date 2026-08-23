#!/usr/bin/env node
import assert from "node:assert/strict";
import JSZip from "jszip";
import {
  attachAnamnesisJson,
  buildAnamnesisPrintDocument,
  buildAnamnesisStoredNote,
  migrateAnamnesisNote,
  parseAnamnesisFromNote,
  stripAnamnesisMachineBlock,
} from "../lib/lekari/dokumentace/anamnesis";
import {
  buildMediktorDocxBytes,
  buildMediktorPdfBytes,
  buildMediktorTxtBytes,
  exportPlainLines,
  looksLikeDocx,
  looksLikePdf,
} from "../lib/lekari/dokumentace/mediktor-files";

const MARKER = "MEDIKTOR_ANAMNESIS_JSON";

const sampleNote = `Nynější onemocnění
Bolest na hrudi 3 dny, bez dušnosti.

Osobní anamnéza
Hypertenze od 2018. Appendektomie 2004.

Rodinná anamnéza
Otec infarkt v 48 letech.

Farmakologická anamnéza
Agen 5 mg 1-0-0

Alergická anamnéza
Penicilin — exantém.

Abúzus
Nekuřák, alkohol příležitostně, káva 2 denně.

Sociální a pracovní anamnéza
Účetní, sedavá práce, žije s manželkou.`;

function assertNoMarker(label: string, text: string) {
  assert.ok(!text.includes(MARKER), `${label} must not contain ${MARKER}`);
  assert.ok(!text.includes("<<<MEDIKTOR"), `${label} must not contain <<<MEDIKTOR`);
}

async function main() {
  const stored = buildAnamnesisStoredNote(migrateAnamnesisNote(sampleNote, null));
  const title = "Anamnestický dotazník pro dospělé pacienty";
  assert.ok(stored.includes(MARKER), "storage must keep machine JSON");

  const truncated = `${stripAnamnesisMachineBlock(stored)}\n\n<<<MEDIKTOR_ANAMNESIS_JSON_V1\n{"schemaVersion":1}`;
  assert.ok(!stripAnamnesisMachineBlock(truncated).includes(MARKER), "strip truncated JSON");

  const lines = exportPlainLines(stored, title);
  assert.ok(stored.length > 0, "stored note empty");
  assert.ok(lines.some((l) => l.includes("1. Identifikační")));
  assert.ok(lines.some((l) => l.includes("2. Nynější")));
  assert.ok(lines.some((l) => l.includes("10. Prohlášení")));
  assert.ok(lines.some((l) => /GDPR|souhlas/i.test(l)));
  assert.ok(lines.some((l) => l.includes("Podpis") || /pacient/i.test(l)));
  assertNoMarker("plain lines", lines.join("\n"));

  const txt = buildMediktorTxtBytes(stored, title);
  assert.ok(txt.byteLength > 32, "txt empty");
  assert.ok(txt[0] !== 0xef || txt[1] !== 0xbb, "txt must not use UTF-8 BOM");
  const txtText = new TextDecoder("utf-8").decode(txt);
  assert.ok(txtText.includes("Agen 5 mg"));
  assertNoMarker("txt", txtText);

  const soapPlain = exportPlainLines(
    attachAnamnesisJson("S: bolest hlavy\nO: TK 120/80\nA: cefalea\nP: klid", migrateAnamnesisNote(sampleNote, null)),
    "SOAP"
  ).join("\n");
  assertNoMarker("soap+json strip", soapPlain);
  assert.ok(soapPlain.includes("Identifika") || soapPlain.includes("bolest") || soapPlain.includes("1."));

  const docx = await buildMediktorDocxBytes(stored, title);
  assert.ok(docx.byteLength > 64, "docx empty");
  assert.ok(looksLikeDocx(docx), "docx missing PK zip signature");
  assert.equal(docx[0], 0x50);
  assert.equal(docx[1], 0x4b);
  assert.equal(docx[2], 0x03);
  assert.equal(docx[3], 0x04);

  const zip = await JSZip.loadAsync(docx);
  const documentXml = await zip.file("word/document.xml")?.async("string");
  assert.ok(documentXml, "docx missing word/document.xml");
  assert.ok(documentXml.includes("xmlns:w="));
  assert.ok(documentXml.includes("w:document"));
  assert.ok(documentXml.includes("Identifika"));
  assert.ok(documentXml.includes("Agen 5 mg"));
  assertNoMarker("docx document.xml", documentXml);
  const allXml = (
    await Promise.all(
      Object.keys(zip.files).map(async (name) => {
        if (!name.endsWith(".xml")) return "";
        return (await zip.file(name)?.async("string")) ?? "";
      })
    )
  ).join("\n");
  assertNoMarker("docx all xml", allXml);
  assert.ok(zip.file("[Content_Types].xml"));
  assert.ok(zip.file("word/styles.xml"));
  assert.ok(zip.file("word/header1.xml"));
  assert.ok(zip.file("word/footer1.xml"));
  assert.ok(documentXml.includes("w:tbl"));
  assert.ok(!documentXml.includes("chronicé"));
  assert.ok(documentXml.includes("Hlavní potíž") || documentXml.includes("Identifika"));

  const pdf = await buildMediktorPdfBytes(stored, title);
  assert.ok(pdf.byteLength > 64, "pdf empty");
  assert.ok(looksLikePdf(pdf), "pdf missing %PDF signature");
  assert.equal(String.fromCharCode(pdf[0], pdf[1], pdf[2], pdf[3], pdf[4]), "%PDF-");
  const pdfText = new TextDecoder("latin1").decode(pdf);
  assert.ok(pdfText.startsWith("%PDF-1."));
  assert.ok(pdfText.includes("endobj") || pdfText.includes("%%EOF") || pdfText.includes("ObjStm"));
  assertNoMarker("pdf", pdfText);
  // WinAnsi Times hack produced tiny PDFs without embedded glyphs; Unicode embed is larger.
  assert.ok(pdf.byteLength > 8_000, "pdf should embed subset font bytes");

  // Round-trip extract: Czech medical sample must survive as readable text
  const { default: pdfParse } = await import("pdf-parse");
  const parsed = await pdfParse(Buffer.from(pdf));
  assert.ok(parsed.text.includes("Identifikační") || parsed.text.includes("Identifika"), "pdf czech Identifikační");
  assert.ok(/Nynější|Nyn[eě]j[sš][ií]/i.test(parsed.text), "pdf czech Nynější");
  assert.ok(parsed.text.includes("Agen 5 mg"));
  assert.ok(/ž|š|č|ř|ď|ť|ň|ů|á|é|í|ó|ú|ý/i.test(parsed.text), "pdf must contain Czech diacritics");
  assert.ok(!parsed.text.includes("vzdelavaci"));
  assert.ok(parsed.text.includes("Strana") || /\/\s*\d/.test(parsed.text));
  assertNoMarker("pdf parse", parsed.text);
  const printHtml = buildAnamnesisPrintDocument(parseAnamnesisFromNote(stored));
  assert.ok(printHtml.includes("1. Identifikační"));
  assert.ok(printHtml.includes("2. Nynější"));
  assert.ok(printHtml.includes("10. Prohlášení"));
  assert.ok(printHtml.includes("(OA)"));
  assert.ok(!printHtml.includes("chronicé"));
  assertNoMarker("print html", printHtml);

  console.log("MeDiktor Word/PDF/TXT export tests passed.");
}

void main();
