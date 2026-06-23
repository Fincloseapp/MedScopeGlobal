/**
 * AI Engine v18 — medical safety filters and disclaimers.
 */

export type SafetyRisk = "low" | "medium" | "high";

export type SafetyResult = {
  safe: boolean;
  blocked: boolean;
  risk: SafetyRisk;
  issues: string[];
  output: string;
  disclaimer: string;
};

export const MEDICAL_DISCLAIMER_CS =
  "Toto není lékařská rada. Obsah je informativní — vždy konzultujte kvalifikovaného zdravotnického pracovníka.";

export const MEDICAL_DISCLAIMER_EN =
  "This is not medical advice. For clinical decisions, consult a qualified healthcare professional.";

const FORBIDDEN_INPUT_PATTERNS: Array<{ pattern: RegExp; issue: string; risk: SafetyRisk }> = [
  {
    pattern: /\b(sebevražd|suicide|kill\s+(myself|yourself)|jak\s+se\s+zab[ií]t)\b/i,
    issue: "Self-harm content blocked",
    risk: "high",
  },
  {
    pattern: /\b(syntetizuj|vyrob|nakup)\s+(drogu|meth|fentanyl|jed)\b/i,
    issue: "Illegal substance instructions blocked",
    risk: "high",
  },
  {
    pattern: /\b(předepsat\s+si|prescribe\s+for\s+me)\s+.*\b(bez\s+lékaře|without\s+doctor)\b/i,
    issue: "Unauthorized prescribing request blocked",
    risk: "high",
  },
  {
    pattern: /\b(ignoruj|ignore)\s+(bezpečnost|safety|disclaimer|pravidl)/i,
    issue: "Safety bypass attempt blocked",
    risk: "high",
  },
  {
    pattern: /\b(jak\s+obch[aá]z|bypass)\s+(regulaci|FDA|EMA|SÚKL)\b/i,
    issue: "Regulatory bypass blocked",
    risk: "medium",
  },
];

const FORBIDDEN_OUTPUT_PATTERNS: Array<{ pattern: RegExp; issue: string }> = [
  { pattern: /\b(garantuji\s+vyléčení|100\s*%\s*vyléčení|guaranteed\s+cure)\b/i, issue: "Absolute cure claim removed" },
  { pattern: /\b(nepotřebujete\s+lékaře|no\s+doctor\s+needed)\b/i, issue: "Anti-clinical guidance removed" },
];

const DRUG_DOSING_LINE_PATTERN =
  /\b\d+\s*(mg|g|ml|mcg|µg|iu|iu\/ml)\b|\b\d+\s*(tablety|tablet|kapky|dávky?)\s*(denně|daily|\/den|každých)\b|\bdávka\s*\d+/i;

/** Detect explicit medication dosing (safety layer for guideline output). */
export function containsDrugDosing(text: string): boolean {
  return DRUG_DOSING_LINE_PATTERN.test(text);
}

function stripDrugDosingLines(text: string): string {
  return text
    .split("\n")
    .filter((line) => !DRUG_DOSING_LINE_PATTERN.test(line))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function assessOutputRisk(text: string): SafetyRisk {
  if (/\b(vysoké\s+riziko|urgent|emergency|okamžitě\s+vyhledejte|call\s+911)\b/i.test(text)) {
    return "high";
  }
  if (/\b(opatrnost|monitor|sledujte|consult|konzultujte)\b/i.test(text)) {
    return "medium";
  }
  return "low";
}

export function scanInputSafety(text: string): {
  safe: boolean;
  blocked: boolean;
  risk: SafetyRisk;
  issues: string[];
} {
  const issues: string[] = [];
  let risk: SafetyRisk = "low";
  let blocked = false;

  for (const rule of FORBIDDEN_INPUT_PATTERNS) {
    if (rule.pattern.test(text)) {
      issues.push(rule.issue);
      if (rule.risk === "high") {
        risk = "high";
        blocked = true;
      } else if (rule.risk === "medium" && risk !== "high") {
        risk = "medium";
      }
    }
  }

  return { safe: issues.length === 0, blocked, risk, issues };
}

export function applySafetyLayer(
  input: string,
  rawOutput: string,
  options?: { stripDrugDosing?: boolean }
): SafetyResult {
  const inputScan = scanInputSafety(`${input}\n${rawOutput}`);

  if (inputScan.blocked) {
    return {
      safe: false,
      blocked: true,
      risk: "high",
      issues: inputScan.issues,
      output: "Požadavek nelze zpracovat z důvodu bezpečnostních pravidel. Vyhledejte odbornou pomoc, pokud jde o akutní stav.",
      disclaimer: MEDICAL_DISCLAIMER_CS,
    };
  }

  let output = rawOutput.trim();
  const issues = [...inputScan.issues];

  for (const rule of FORBIDDEN_OUTPUT_PATTERNS) {
    if (rule.pattern.test(output)) {
      output = output.replace(rule.pattern, "[odstraněno — bezpečnostní filtr]");
      issues.push(rule.issue);
    }
  }

  if (options?.stripDrugDosing && containsDrugDosing(output)) {
    output = stripDrugDosingLines(output);
    issues.push("Drug dosing lines removed (guideline safety)");
  }

  const risk = inputScan.risk === "low" ? assessOutputRisk(output) : inputScan.risk;

  if (!output.includes("není lékařská rada") && !output.includes("not medical advice")) {
    output = `${output}\n\n---\n${MEDICAL_DISCLAIMER_CS}\n${MEDICAL_DISCLAIMER_EN}`;
  }

  return {
    safe: !inputScan.blocked,
    blocked: false,
    risk,
    issues,
    output,
    disclaimer: MEDICAL_DISCLAIMER_CS,
  };
}
