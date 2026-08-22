import { LEGAL_DISCLAIMER, type PatientSummary } from "@/lib/medipacient/patient-summary";

function formatDate(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso.length === 10 ? `${iso}T12:00:00` : iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("cs-CZ", { day: "numeric", month: "long", year: "numeric" });
}

const DEVICE_LINE = "MeDipacient není zdravotnický prostředek.";

/** Short Czech plain-text for family — never the original medical file. */
export function buildFamilyShareText(summary: PatientSummary, documentName?: string): string {
  const disclaimer = (summary.pravni_dolozka || LEGAL_DISCLAIMER).trim();
  const kontrola = formatDate(summary.termin_kontroly.vypoctene_datum);
  const lines: string[] = ["Srozumitelný překlad z MeDipacient", ""];
  if (documentName) lines.push(`Zpráva: ${documentName}`);
  lines.push(`Obor: ${summary.obor_lekare || "Neuvedeno"}`);
  if (summary.termin_kontroly.nalezeno && kontrola) {
    lines.push(`Kontrola: ${kontrola}`);
  }
  if (summary.srozumitelny_preklad.trim()) {
    lines.push("", summary.srozumitelny_preklad.trim());
  }
  if (summary.doporuceny_postup.length) {
    lines.push("", "Co dál:");
    for (const item of summary.doporuceny_postup.slice(0, 5)) {
      lines.push(`• ${item}`);
    }
  }
  let body = lines
    .filter((line, i, arr) => !(line === "" && arr[i - 1] === ""))
    .join("\n")
    .trim();
  if (disclaimer && !body.includes(disclaimer)) body = `${body}\n\n${disclaimer}`;
  if (!body.includes(DEVICE_LINE)) body = `${body}\n${DEVICE_LINE}`;
  return body;
}

export async function copyTextToClipboard(text: string): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      /* fall through */
    }
  }
  if (typeof document === "undefined") return false;
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  } catch {
    return false;
  }
}
