import type { V24ContentDraft, V24ContentType, V24SectionId, V24SpecialtyId } from "@/lib/v24/types";
import { V24_DEFAULT_LOCALE } from "@/lib/v24/config";
import { buildTopicHash } from "@/lib/v24/engines/dedupe/hash-generator";
import { getV24Section } from "@/lib/v24/sections";

const TOPIC_BANK: Record<V24SectionId, string[]> = {
  medicine: ["Hypertenze v primární péči", "Anémie — diferenciální diagnostika", "Akutní břicho"],
  drugs: ["Nová registrace SGLT2 inhibitorů", "Farmakovigilance — bezpečnostní signál"],
  legislation: ["Úhrady MZČR — metodická změna", "Novela zákona o zdravotních službách"],
  "digital-health": ["AI v radiologii — klinické nasazení", "eRecept a interoperabilita"],
  news: ["České zdravotnictví — týdenní přehled", "Evropská regulace zdravotnických prostředků"],
  study: ["Anatomie srdce — 2. ročník LF", "Fyziologie ledvin — příprava na zkoušku"],
  "pre-med": ["Přijímačky z chemie — strategie", "Motivační dopis na LF"],
  specialties: ["Revmatoidní artritida — early treat", "STEMI — akutní algoritmus"],
  articles: ["Evidence-based přehled antikoagulace", "Klinický dopad nové studie"],
  quizzes: ["Farmakologie — antihypertenziva", "Anatomie — dolní končetina"],
};

function buildBody(
  title: string,
  section: V24SectionId,
  contentType: V24ContentType,
  specialty?: V24SpecialtyId
) {
  const spec = specialty ? ` (${specialty.replace(/-/g, " ")})` : "";
  return `
<h2>Klinický kontext${spec}</h2>
<p>${title} — odborný přehled pro českou klinickou praxi s důrazem na evidence-based medicínu a bezpečné edukativní shrnutí.</p>
<h2>Klinický dopad</h2>
<p>Strukturovaný přehled dopadu na rozhodování v ambulantní i hospitalizované péči.</p>
<h2>Diferenciální diagnostika</h2>
<ul><li>Primární diagnóza</li><li>Alternativní diagnóza A</li><li>Alternativní diagnóza B</li><li>Red flags — varovné příznaky</li></ul>
<h2>Léčba a monitorování</h2>
<p>Obecný léčebný rámec bez individuálního dávkování — vždy v kontextu aktuálních guidelines a lokálních metodik.</p>
<h2>Prevence a edukace pacienta</h2>
<p>Doporučení pro sdílené rozhodování a sledování závažnosti stavu.</p>
${contentType === "case-study" ? "<h2>Kazuistika</h2><p>Prezentace případu s klinickým zamyšlením a učebními body.</p>" : ""}
`.trim();
}

export function generateV24Draft(params: {
  section: V24SectionId;
  index?: number;
  specialty?: V24SpecialtyId;
  studyYear?: number;
  locale?: string;
  angleHint?: string;
}): V24ContentDraft {
  const cfg = getV24Section(params.section);
  const topics = TOPIC_BANK[params.section];
  const base = topics[(params.index ?? 0) % topics.length];
  const title = params.angleHint ? `${base} — ${params.angleHint}` : base;
  const contentType = (cfg?.contentTypes[0] ?? "article") as V24ContentType;

  const draft: V24ContentDraft = {
    section: params.section,
    specialty: params.specialty,
    studyYear: params.studyYear as V24ContentDraft["studyYear"],
    contentType,
    title,
    summary: `${title}. Odborný medicínský obsah MedScopeGlobal — shrnutí pro lékaře a studenty LF v češtině.`,
    bodyHtml: buildBody(title, params.section, contentType, params.specialty),
    keywords: [params.section, params.specialty ?? "medicína", "MedScopeGlobal", "evidence-based"],
    differentialDiagnosis: ["Primární diagnóza", "Alternativa A", "Alternativa B", "Red flags"],
    treatmentPlan: ["Diagnostický algoritmus", "Léčebný rámec", "Monitorování a kontrola"],
    casePresentation: contentType === "case-study" ? "Pacient s typickou prezentací — učební kazuistika." : undefined,
    sourceName: "MedScopeGlobal Editorial",
    sourceUrl: "https://medscopeglobal.com",
    topicHash: "",
    locale: params.locale ?? V24_DEFAULT_LOCALE,
  };

  draft.topicHash = buildTopicHash(draft);
  return draft;
}
