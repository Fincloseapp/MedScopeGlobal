export type AdEditorId = "legal" | "harm" | "diplomatic";

export type AdEditorVerdict = "pass" | "fail" | "review";

export type AdEditorReport = {
  editor: AdEditorId;
  label: string;
  verdict: AdEditorVerdict;
  notes: string[];
};

export type AdEditorialBoard = {
  legal: AdEditorReport;
  harm: AdEditorReport;
  diplomatic: AdEditorReport;
  recommendation: "allow" | "deny" | "admin";
  checkedAt: string;
};

export type AdCreativeInput = {
  company: string;
  adText?: string | null;
  bannerUrl?: string | null;
  targetUrl?: string | null;
  type?: string | null;
};

const LEGAL_FAIL = [
  /miracle|zázrak|100\s*%|guaranteed cure|vyléčí|bez vedlejších/i,
  /replace your (doctor|physician)|nahraďte lékaře|stop taking medication/i,
  /fda approved miracle|instant weight loss|zaručeně zhubnete/i,
  /diagnóz[au]|léčebn(é|ý) doporučen/i,
];

const HARM_FAIL = [
  /hate|násilí|violence against|rasis|xenoph/i,
  /suicide|sebevražd|self.?harm/i,
  /illegal drug|nelegální drog/i,
  /csam|child porn|dětskou porn/i,
];

const DIPLOMATIC_FAIL = [
  /politick(á|y) kampaň|vote for|volte stranu/i,
  /nábožensk(á|ý) nenávist|holy war/i,
  /fake news|dezinformace o vakcín/i,
];

const LEGAL_REVIEW = [/klinick(á|é) stud|off.?label|prescription/i];
const HARM_REVIEW = [/alkohol|cannabis|cbd|thc/i];
const DIPLOMATIC_REVIEW = [/válečn|conflict|embargo/i];

function scan(text: string, fail: RegExp[], review: RegExp[]): { verdict: AdEditorVerdict; notes: string[] } {
  const notes: string[] = [];
  for (const rule of fail) {
    if (rule.test(text)) notes.push(`blokováno: ${rule.source}`);
  }
  if (notes.length) return { verdict: "fail", notes };
  for (const rule of review) {
    if (rule.test(text)) notes.push(`k lidskému dohledu: ${rule.source}`);
  }
  if (notes.length) return { verdict: "review", notes };
  return { verdict: "pass", notes: ["bez automatického nálezu"] };
}

export function runAdEditorBoard(input: AdCreativeInput): AdEditorialBoard {
  const blob = [input.company, input.adText, input.bannerUrl, input.targetUrl, input.type]
    .filter(Boolean)
    .join("\n");
  const legalScan = scan(blob, LEGAL_FAIL, LEGAL_REVIEW);
  const harmScan = scan(blob, HARM_FAIL, HARM_REVIEW);
  const diploScan = scan(blob, DIPLOMATIC_FAIL, DIPLOMATIC_REVIEW);

  const legal: AdEditorReport = {
    editor: "legal",
    label: "Editor právní — zákonnost a zdravotní tvrzení",
    ...legalScan,
  };
  const harm: AdEditorReport = {
    editor: "harm",
    label: "Editor bezpečnosti — neškodnost obsahu",
    ...harmScan,
  };
  const diplomatic: AdEditorReport = {
    editor: "diplomatic",
    label: "Editor diplomatický — slušnost a neutrální tón",
    ...diploScan,
  };

  const verdicts = [legal.verdict, harm.verdict, diplomatic.verdict];
  let recommendation: AdEditorialBoard["recommendation"] = "allow";
  if (verdicts.includes("fail")) recommendation = "deny";
  else if (verdicts.includes("review")) recommendation = "admin";

  return {
    legal,
    harm,
    diplomatic,
    recommendation,
    checkedAt: new Date().toISOString(),
  };
}
