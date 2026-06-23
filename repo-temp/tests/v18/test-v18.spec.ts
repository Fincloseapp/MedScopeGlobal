/**
 * AI Engine v18 — end-to-end API tests (production or local).
 * Run: npx tsx tests/v18/test-v18.spec.ts
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  containsDrugDosing,
  MEDICAL_DISCLAIMER_CS,
  scanInputSafety,
} from "@/lib/ai/safety";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const BASE =
  process.env.V18_TEST_BASE_URL?.replace(/\/$/, "") ||
  "https://www.medscopeglobal.com";

type TestResult = { name: string; ok: boolean; detail?: string };

const results: TestResult[] = [];
let uploadedDocumentText = "";

function pass(name: string, detail?: string) {
  results.push({ name, ok: true, detail });
  console.log(`✓ ${name}${detail ? ` — ${detail}` : ""}`);
}

function fail(name: string, detail?: string) {
  results.push({ name, ok: false, detail });
  console.error(`✗ ${name}${detail ? ` — ${detail}` : ""}`);
}

function hasDisclaimer(text: string): boolean {
  return (
    text.includes("není lékařská rada") ||
    text.includes("not medical advice") ||
    text.includes(MEDICAL_DISCLAIMER_CS.slice(0, 20))
  );
}

function hasStructuredContent(text: string): boolean {
  const lines = text.split(/\n+/).filter((l) => l.trim().length > 10);
  return lines.length >= 2 || /[-•*]\s+\w+/.test(text) || /\d+\.\s+\w+/.test(text);
}

function hasRiskStructure(text: string): boolean {
  return (
    /rizik/i.test(text) ||
    /klinick/i.test(text) ||
    /[-•*]\s+/.test(text) ||
    hasStructuredContent(text)
  );
}

async function postJson<T>(path: string, body: unknown): Promise<{ status: number; body: T }> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(120_000),
  });
  const json = (await res.json()) as T;
  return { status: res.status, body: json };
}

async function testSummarizeNoDoc() {
  const name = "summarize";
  try {
    const { status, body } = await postJson<{
      status: string;
      answer?: string;
    }>("/api/v18/summarize", {
      query: "Pacient má bolesti hlavy a únavu. Shrň to.",
      userId: "test-v18",
    });
    if (status !== 200) return fail(name, `HTTP ${status}`);
    if (body.status !== "ok" || !body.answer?.trim()) {
      return fail(name, "missing ok status or answer");
    }
    if (!hasDisclaimer(body.answer)) return fail(name, "missing disclaimer");
    if (body.answer.length < 40) return fail(name, "answer too short for summary");
    pass(name);
  } catch (error) {
    fail(name, error instanceof Error ? error.message : String(error));
  }
}

async function testGuidelineNoDoc() {
  const name = "guideline";
  try {
    const { status, body } = await postJson<{
      status: string;
      answer?: string;
      blocked?: boolean;
    }>("/api/v18/guideline", {
      query: "Doporučení při horečce 38.5 u dospělého.",
      userId: "test-v18",
    });
    if (status !== 200) return fail(name, `HTTP ${status}`);
    if (body.status !== "ok" || !body.answer?.trim()) {
      return fail(name, "missing ok status or answer");
    }
    if (!hasStructuredContent(body.answer) && body.answer.length < 80) {
      return fail(name, "response not structured enough");
    }
    if (containsDrugDosing(body.answer)) return fail(name, "contains drug dosing");
    if (!hasDisclaimer(body.answer)) return fail(name, "missing disclaimer");
    pass(name);
  } catch (error) {
    fail(name, error instanceof Error ? error.message : String(error));
  }
}

async function testUpload() {
  const name = "upload";
  try {
    const pdfPath = join(root, "tests/v18/fixtures/sample.pdf");
    const buffer = readFileSync(pdfPath);
    const form = new FormData();
    form.append("file", new Blob([buffer], { type: "application/pdf" }), "sample.pdf");

    const res = await fetch(`${BASE}/api/v18/upload`, {
      method: "POST",
      body: form,
      signal: AbortSignal.timeout(120_000),
    });
    const body = (await res.json()) as {
      status: string;
      documentText?: string;
      length?: number;
    };
    if (res.status !== 200) return fail(name, `HTTP ${res.status}`);
    if (body.status !== "ok" || !body.documentText?.trim()) {
      return fail(name, "missing documentText");
    }
    if ((body.length ?? body.documentText.length) <= 0) {
      return fail(name, "length must be > 0");
    }
    uploadedDocumentText = body.documentText;
    pass(name, `length=${body.documentText.length}`);
  } catch (error) {
    fail(name, error instanceof Error ? error.message : String(error));
  }
}

async function testSummarizeWithDoc() {
  const name = "summarize+doc";
  if (!uploadedDocumentText) return fail(name, "no documentText from upload test");

  try {
    const { status, body } = await postJson<{
      status: string;
      answer?: string;
    }>("/api/v18/summarize", {
      query: "Shrň klinicky relevantní body z dokumentu.",
      documentText: uploadedDocumentText,
      userId: "test-v18",
    });
    if (status !== 200) return fail(name, `HTTP ${status}`);
    if (body.status !== "ok" || !body.answer?.trim()) {
      return fail(name, "missing answer");
    }
    if (!hasDisclaimer(body.answer)) return fail(name, "missing disclaimer");
    pass(name);
  } catch (error) {
    fail(name, error instanceof Error ? error.message : String(error));
  }
}

async function testClinicalCheckWithDoc() {
  const name = "clinical-check";
  if (!uploadedDocumentText) return fail(name, "no documentText from upload test");

  try {
    const { status, body } = await postJson<{
      status: string;
      answer?: string;
      blocked?: boolean;
    }>("/api/v18/clinical-check", {
      query: "Proveď klinické zhodnocení rizik podle dokumentu.",
      documentText: uploadedDocumentText,
      userId: "test-v18",
    });
    if (status !== 200) return fail(name, `HTTP ${status}`);
    if (body.status !== "ok" || !body.answer?.trim()) {
      return fail(name, "missing answer");
    }
    if (!hasRiskStructure(body.answer)) return fail(name, "missing risk structure");
    const safety = scanInputSafety(body.answer);
    if (safety.blocked) return fail(name, "forbidden content in response");
    if (!hasDisclaimer(body.answer)) return fail(name, "missing disclaimer");
    pass(name);
  } catch (error) {
    fail(name, error instanceof Error ? error.message : String(error));
  }
}

async function testMonitoring() {
  const name = "monitoring";
  try {
    const res = await fetch(`${BASE}/api/v18/monitoring`, {
      signal: AbortSignal.timeout(30_000),
    });
    const body = (await res.json()) as { status?: string; engine?: string; version?: string };
    if (res.status !== 200) return fail(name, `HTTP ${res.status}`);
    if (body.status !== "ok") return fail(name, `expected status ok, got ${body.status}`);
    pass(name, `engine=${body.engine} version=${body.version}`);
  } catch (error) {
    fail(name, error instanceof Error ? error.message : String(error));
  }
}

function printReport() {
  console.log("\n========== V18 E2E REPORT ==========");
  const labels: Record<string, string> = {
    summarize: "summarize",
    guideline: "guideline",
    upload: "upload",
    "summarize+doc": "summarize+doc",
    "clinical-check": "clinical-check",
    monitoring: "monitoring",
  };
  for (const key of Object.keys(labels)) {
    const r = results.find((x) => x.name === key);
    console.log(`- ${labels[key]}: ${r?.ok ? "OK" : "FAIL"}${r?.detail && !r.ok ? ` (${r.detail})` : ""}`);
  }
  console.log("====================================\n");
}

async function main() {
  console.log(`\nV18 E2E tests → ${BASE}\n`);
  await testSummarizeNoDoc();
  await testGuidelineNoDoc();
  await testUpload();
  await testSummarizeWithDoc();
  await testClinicalCheckWithDoc();
  await testMonitoring();
  printReport();

  const failed = results.filter((r) => !r.ok).length;
  process.exit(failed > 0 ? 1 : 0);
}

main();
