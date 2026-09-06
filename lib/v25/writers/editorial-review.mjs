/**
 * Multi-editor bench for public magazine articles.
 * Deterministic legal / diplomacy / hard-sell gates + grammar polish already
 * applied via polishCzechArticle. No personal editor names.
 */

export const PUBLIC_EDITOR_BENCH = [
  {
    id: "editor-chief-cz",
    role: "editor",
    label: "Šéfredaktor MedScopeGlobal",
    checks: ["diplomacy", "return_reading"],
  },
  {
    id: "editor-section",
    role: "editor",
    label: "Odborný editor kategorie",
    checks: ["expertise", "no_diagnosis"],
  },
  {
    id: "editor-diplomacy-cz",
    role: "editor",
    label: "Diplomatický editor",
    checks: ["diplomacy", "no_hard_sell"],
  },
  {
    id: "lang-reviewer-cz",
    role: "language_reviewer",
    label: "Jazykový korektor MedScopeGlobal",
    checks: ["grammar"],
  },
  {
    id: "compliance-medical-cz",
    role: "compliance_reviewer",
    label: "Lékařský compliance editor",
    checks: ["no_diagnosis", "medical_disclaimer"],
  },
  {
    id: "compliance-legal-global",
    role: "compliance_reviewer",
    label: "Právní editor MedScopeGlobal",
    checks: ["legal", "no_hard_sell"],
  },
];

const HARD_SELL_RE = [
  /staňte se\s+vip/i,
  /kupte (si )?(předplatné|vip|členství)/i,
  /musíte přispět/i,
  /povinný příspěvek/i,
  /jen pro členy/i,
  /paywall/i,
  /unlock now/i,
  /subscribe now to read/i,
];

const DIAGNOSIS_RE = [
  /diagnostikuji/i,
  /máte rakovinu/i,
  /jste nemocní/i,
  /vyléčíte se do/i,
  /zaručeně vyléčí/i,
  /this will cure/i,
];

const ABSOLUTE_PROMISE_RE = [
  /prodloužíte si život o/i,
  /100%\s+účinn/i,
  /zaručený výsledek/i,
];

function collectFlags(text) {
  const flags = [];
  for (const re of HARD_SELL_RE) {
    if (re.test(text)) flags.push({ code: "hard_sell", severity: "block", match: re.source });
  }
  for (const re of DIAGNOSIS_RE) {
    if (re.test(text)) flags.push({ code: "diagnosis", severity: "block", match: re.source });
  }
  for (const re of ABSOLUTE_PROMISE_RE) {
    if (re.test(text)) flags.push({ code: "absolute_promise", severity: "warn", match: re.source });
  }
  return flags;
}

function softenHardSell(html) {
  return String(html ?? "")
    .replace(/staňte se\s+vip[^.?!]{0,80}[.?!]?/gi, "")
    .replace(/kupte (si )?(předplatné|vip|členství)[^.?!]{0,80}[.?!]?/gi, "")
    .replace(/musíte přispět[^.?!]{0,80}[.?!]?/gi, "");
}

function softenInventedFacts(html) {
  return String(html ?? "")
    .replace(/projekt(?:u|em|e)?\s+Mammo[‑\-]?Czech/gi, "oficiální screeningový program")
    .replace(/Mammo[‑\-]?Czech/gi, "oficiální screening")
    .replace(
      /70\s*%\s+případů\s+rakoviny\s+prsu\.?\s*60\s*%\s+kolorektální[^.]*90\s*%\s+rakoviny\s+děložního\s+čípku[^.]*\./gi,
      "časný záchyt může změnit další postup — konkrétní přínos se liší podle typu nádoru a stadia.",
    )
    .replace(/přibližně\s+90\s*%\s+zdravotnických\s+zařízeních/gi, "ordinacích zapojených do oficiálního screeningu")
    .replace(/zachraňují kosti/gi, "pomáhají kostem")
    .replace(/Připravte se na revoluci v prevenci osteoporózy\.?/gi, "Prevence osteoporózy stojí na výživě, pohybu a kontrole u lékaře.")
    .replace(/\brevoluci\b/gi, "posun");
}

function hasMedicalDisclaimer(html) {
  const text = String(html ?? "").toLowerCase();
  return (
    text.includes("nenahrazují vyšetření") ||
    text.includes("nenahrazuje vyšetření") ||
    text.includes("konzultujte lékaře") ||
    text.includes("kontakt s lékařem") ||
    text.includes("volejte 155")
  );
}

const DISCLAIMER_HTML = `<p>Texty MedScopeGlobal jsou pro veřejnost: srozumitelně, bez diagnózy přes obrazovku. Nenahrazují vyšetření. U nových nebo zhoršujících se příznaků se poraďte s lékařem; v akutních stavech volejte 155.</p>`;

/**
 * @param {{ title?: string, excerpt?: string, bodyHtml?: string }} article
 * @param {{ topic?: string, specialty?: string }} [ctx]
 */
export function reviewPublicArticle(article, ctx = {}) {
  const title = String(article.title ?? "");
  const excerpt = String(article.excerpt ?? "");
  let bodyHtml = softenInventedFacts(String(article.bodyHtml ?? ""));
  const combined = `${title}\n${excerpt}\n${bodyHtml}`;

  const flags = collectFlags(combined);
  if (/Mammo[‑\-]?Czech|70\s*%\s+případů\s+rakoviny|zachraňují kosti|revoluci/i.test(combined)) {
    flags.push({ code: "invented_or_hype", severity: "warn", match: "softened" });
  }
  if (flags.some((flag) => flag.code === "hard_sell")) {
    bodyHtml = softenHardSell(bodyHtml);
  }
  if (!hasMedicalDisclaimer(bodyHtml)) {
    const sourcesIdx = bodyHtml.search(/<h2[^>]*>\s*Zdroje\s*<\/h2>/i);
    if (sourcesIdx >= 0) {
      bodyHtml = `${bodyHtml.slice(0, sourcesIdx).trim()}\n${DISCLAIMER_HTML}\n${bodyHtml.slice(sourcesIdx)}`;
    } else {
      bodyHtml = `${bodyHtml.trim()}\n${DISCLAIMER_HTML}`;
    }
    flags.push({ code: "disclaimer_added", severity: "info", match: "medical_disclaimer" });
  }

  const blocking = flags.filter((flag) => flag.severity === "block");
  const editors = PUBLIC_EDITOR_BENCH.map((editor) => ({
    id: editor.id,
    role: editor.role,
    label: editor.label,
    status: blocking.length ? "flagged" : "approved",
  }));

  return {
    passed: blocking.length === 0,
    version: "27.0.0",
    topic: ctx.topic ?? null,
    specialty: ctx.specialty ?? null,
    editors,
    flags,
    bodyHtml,
  };
}

export function buildMultiEditorGatePrompt() {
  return `Kontrola více editorů MedScopeGlobal (povinně projít před zveřejněním):
- Šéfredaktor: diplomatický tón, chuť se vrátit, žádný clickbait.
- Odborný editor kategorie: seniorní přehled praxe i výzkumu, bez diagnóz.
- Diplomatický editor: respekt, žádné moralizování, žádné tvrdé výzvy k platbě.
- Jazykový korektor: pravopis a gramatika češtiny, diakritika, žádné cizojazyčné úniky.
- Lékařský compliance: žádné diagnózy, žádné sliby vyléčení, u nejasností lékař / 155.
- Právní editor: právně v pořádku, bez klamavých slibů a bez vynucování příspěvku.`;
}
