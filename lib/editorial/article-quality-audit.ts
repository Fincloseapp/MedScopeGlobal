export type AuditableArticle = {
  id: string;
  title?: string | null;
  slug?: string | null;
  excerpt?: string | null;
  content?: string | null;
  metadata?: Record<string, unknown> | null;
  published_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  source_url?: string | null;
  source_name?: string | null;
  audience?: string | null;
  min_access_level?: string | null;
  locale?: string | null;
  rubric_slug?: string | null;
  content_type?: string | null;
  ai_generated?: boolean | null;
};

export type ArticleAuditIssue = {
  code: string;
  severity: "info" | "warning" | "critical";
  detail: string;
};

export type ArticleAuditResult = {
  id: string;
  slug: string;
  title: string;
  wordCount: number;
  score: number;
  physicianAudience: boolean;
  issues: ArticleAuditIssue[];
  severe: boolean;
  safeMetadataPatch: Record<string, unknown> | null;
};

const BOILERPLATE_MARKERS = [
  "není třeba být expert",
  "tento článek připravila redakce medscopeglobal",
  "stačí pár jasných kroků a vědomé rozhodování",
  "profesionální shrnutí pro českou klinickou a vzdělávací praxi",
  "odborný přehled — medicínský obsah",
  "odborný přehled — klinická studie",
  "obsah je připraven pro českou odbornou praxi s odkazem na primární zdroj",
  "pro plné redakční zpracování nastavte",
  "automatické shrnutí z mezinárodního lékařského zdroje",
  "bibliografické údaje nebyly ve vstupu k dispozici",
  "ověřené zdroje nebyly pro fallback dodány",
  "tento koncept není připraven k publikaci",
  "zahraniční zdravotnická zpráva",
  "zdravotní zpráva: zahraniční",
];

const GENERIC_PHRASES = [
  "v dnešní době",
  "je důležité si uvědomit",
  "v tomto článku se podíváme",
  "závěrem lze říci",
  "v konečném důsledku",
  "pojďme se podívat",
];

const ENGLISH_COMMON_WORDS =
  /\b(the|and|with|for|from|study|trial|patients|treatment|results|clinical|randomized|guideline|review|health|disease|risk|outcomes?)\b/gi;
const CZECH_COMMON_WORDS =
  /\b(a|ale|bez|by|byl|byla|co|do|je|jsou|který|která|léčba|lékař|na|nebo|pacient|podle|po|pro|při|se|s|u|ve|v|z|ze)\b/gi;

function plainText(value: string | null | undefined): string {
  return String(value ?? "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&(?:nbsp|amp|lt|gt|quot|#39);/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function countWords(value: string): number {
  return plainText(value).split(/\s+/).filter(Boolean).length;
}

function isHttpUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return (url.protocol === "https:" || url.protocol === "http:") && Boolean(url.hostname);
  } catch {
    return false;
  }
}

const JOURNAL_OR_STUDY_CLAIM =
  /\b(the lancet|lancet rheumatology|nejm|new england journal|bmj|jama|cochrane|nature medicine|pubmed|doi\.org|who director|royal college|randomized controlled trial|randomizovan[áa] kontrolovan[áa] stud)\b/i;

export function claimsExternalSource(article: AuditableArticle): boolean {
  if (isExternalSourceName(article.source_name)) return true;
  const citation = metadataCitation(article.metadata);
  if (isExternalSourceName(citation?.name)) return true;
  if (isHttpUrl(article.source_url) || isHttpUrl(citation?.url)) return true;
  const blob = `${article.title ?? ""}\n${article.slug ?? ""}\n${article.excerpt ?? ""}\n${article.source_name ?? ""}`;
  if (JOURNAL_OR_STUDY_CLAIM.test(blob)) return true;
  const slug = String(article.slug ?? "");
  const slugParts = slug.split("-").filter(Boolean);
  const englishHits = slug.match(ENGLISH_COMMON_WORDS)?.length ?? 0;
  return (
    slugParts.length >= 8 &&
    englishHits >= 3 &&
    !/[áčďéěíňóřšťúůýž]/i.test(slug)
  );
}

export function isOriginalMedScopeEditorial(article: AuditableArticle): boolean {
  const metadata = article.metadata ?? {};
  if (
    metadata.original_editorial === true ||
    metadata.origin === "medscopeglobal" ||
    metadata.editorial_origin === "original"
  ) {
    return !claimsExternalSource(article);
  }
  const sourceName = String(article.source_name ?? "").toLowerCase();
  if (
    sourceName.includes("medscopeglobal") ||
    sourceName.startsWith("redakce") ||
    sourceName.startsWith("medscope ")
  ) {
    return !claimsExternalSource(article);
  }
  return !claimsExternalSource(article);
}

function isExternalSourceName(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const normalized = value.trim().toLowerCase();
  return (
    normalized.length >= 2 &&
    !normalized.includes("medscopeglobal") &&
    !normalized.startsWith("redakce medscope") &&
    !normalized.startsWith("medscope ")
  );
}

function deriveSourceName(sourceName: unknown, sourceUrl: string): string {
  if (typeof sourceName === "string") {
    const prefix = sourceName.split(/\s+[·|]\s+/)[0]?.trim();
    if (isExternalSourceName(prefix)) return prefix;
  }
  try {
    return new URL(sourceUrl).hostname.replace(/^www\./i, "");
  } catch {
    return "ověřený online zdroj";
  }
}

function metadataCitation(metadata: Record<string, unknown> | null | undefined) {
  const citation = metadata?.source_citation;
  return citation && typeof citation === "object"
    ? (citation as Record<string, unknown>)
    : null;
}

function hasHeadingOrPhrase(content: string, patterns: RegExp[]): boolean {
  const text = plainText(content);
  return patterns.some((pattern) => pattern.test(content) || pattern.test(text));
}

function isEnglishDominant(value: string): boolean {
  const text = plainText(value);
  const english = text.match(ENGLISH_COMMON_WORDS)?.length ?? 0;
  const czech = text.match(CZECH_COMMON_WORDS)?.length ?? 0;
  return english >= 5 && english > czech * 1.5;
}

function pushIssue(
  issues: ArticleAuditIssue[],
  code: string,
  severity: ArticleAuditIssue["severity"],
  detail: string
) {
  if (!issues.some((issue) => issue.code === code)) issues.push({ code, severity, detail });
}

export const PHYSICIAN_MIN_WORDS = 600;
export const PUBLIC_MIN_WORDS = 350;
export const INGESTION_MIN_SCORE = 70;

export function isPhysicianAudience(article: AuditableArticle): boolean {
  return (
    article.min_access_level === "physician" ||
    article.audience === "physician" ||
    article.audience === "professional"
  );
}

export function publishWordMinimum(article: AuditableArticle): number {
  return isPhysicianAudience(article) ? PHYSICIAN_MIN_WORDS : PUBLIC_MIN_WORDS;
}

export function passesIngestionQualityGate(
  article: AuditableArticle,
  now = new Date()
): { ready: boolean; audit: ArticleAuditResult } {
  const audit = auditArticle(article, now);
  const codes = new Set(audit.issues.map((issue) => issue.code));
  const ready =
    !audit.severe &&
    !codes.has("thin_content") &&
    audit.wordCount >= publishWordMinimum(article) &&
    audit.score >= INGESTION_MIN_SCORE;
  return { ready, audit };
}

export function auditArticle(
  article: AuditableArticle,
  now = new Date()
): ArticleAuditResult {
  const title = String(article.title ?? "").trim();
  const content = String(article.content ?? "");
  const excerpt = String(article.excerpt ?? "");
  const combined = `${title}\n${excerpt}\n${plainText(content)}`;
  const lower = combined.toLowerCase();
  const wordCount = countWords(content);
  const issues: ArticleAuditIssue[] = [];
  const physicianAudience = isPhysicianAudience(article);
  const wordMinimum = publishWordMinimum(article);

  if (wordCount < 120) {
    pushIssue(issues, "stub_content", "critical", `Pouze ${wordCount} slov v těle článku.`);
  } else if (wordCount < wordMinimum) {
    pushIssue(
      issues,
      "thin_content",
      "warning",
      `${wordCount} slov; pod minimem ${wordMinimum} pro ${physicianAudience ? "odborný" : "redakční"} článek.`
    );
  }

  const boilerplateHits = BOILERPLATE_MARKERS.filter((marker) => lower.includes(marker));
  if (boilerplateHits.length) {
    pushIssue(
      issues,
      "boilerplate_or_fallback",
      "critical",
      `Nalezeno ${boilerplateHits.length} známých šablonových markerů.`
    );
  }

  const genericHits = GENERIC_PHRASES.filter((marker) => lower.includes(marker));
  if (genericHits.length >= 2) {
    pushIssue(
      issues,
      "generic_template_prose",
      "warning",
      `Nalezeny ${genericHits.length} generické redakční fráze.`
    );
  }

  const locale = String(article.locale ?? article.metadata?.locale ?? "cs").toLowerCase();
  if (locale.startsWith("cs") && (isEnglishDominant(title) || isEnglishDominant(excerpt))) {
    pushIssue(
      issues,
      "czech_display_quality",
      "critical",
      "Český článek má anglicky dominantní titulek nebo perex."
    );
  } else if (locale.startsWith("cs") && isEnglishDominant(content)) {
    pushIssue(
      issues,
      "czech_body_quality",
      "warning",
      "Tělo českého článku je podle jazykové heuristiky anglicky dominantní."
    );
  }

  const publishedAt = article.published_at ? new Date(article.published_at) : null;
  if (!publishedAt || Number.isNaN(publishedAt.getTime())) {
    pushIssue(issues, "missing_publication_date", "warning", "Chybí platné datum publikace.");
  } else if (publishedAt.getTime() > now.getTime() + 15 * 60 * 1000) {
    pushIssue(
      issues,
      "future_publication_date",
      "critical",
      `Datum publikace je v budoucnosti: ${publishedAt.toISOString()}.`
    );
  }

  const citation = metadataCitation(article.metadata);
  const sourceUrlValid = isHttpUrl(article.source_url);
  const citationUrlValid = isHttpUrl(citation?.url);
  const citationNameValid =
    typeof citation?.name === "string" && citation.name.trim().length >= 2;
  const hasSourceSection = hasHeadingOrPhrase(content, [
    /<h2[^>]*>\s*(zdroje|literatura|reference)\b/i,
    /\b(zdroje|literatura|reference)\s*:/i,
  ]);

  const originalEditorial = isOriginalMedScopeEditorial(article);
  if (!sourceUrlValid && !citationUrlValid && !originalEditorial) {
    pushIssue(
      issues,
      "missing_verifiable_source_url",
      physicianAudience ? "critical" : "warning",
      "Článek odkazuje na externí zdroj, ale chybí platná HTTP(S) adresa."
    );
  }
  if (!citationNameValid) {
    pushIssue(
      issues,
      "missing_source_metadata",
      "warning",
      "Metadata source_citation neobsahují název zdroje."
    );
  }
  if (!hasSourceSection) {
    pushIssue(
      issues,
      "missing_source_section",
      physicianAudience ? "critical" : "warning",
      "V textu chybí jasně označená sekce zdrojů."
    );
  }

  const doiValues = combined.match(/\b10\.\d{4,9}\/[-._;()/:A-Z0-9]+\b/gi) ?? [];
  const malformedDoiMention = /\bdoi\b/i.test(combined) && doiValues.length === 0;
  if (malformedDoiMention) {
    pushIssue(
      issues,
      "unverifiable_doi_text",
      "warning",
      "Text zmiňuje DOI, ale neobsahuje syntakticky platný DOI identifikátor."
    );
  }

  if (physicianAudience) {
    if (
      !hasHeadingOrPhrase(content, [
        /\b(limity|omezení|limitace|nejistot[ay]|co studie neprokazuje)\b/i,
        /nelze tvrdit/i,
        /co z původní publikace/i,
        /nedokazuje/i,
      ])
    ) {
      pushIssue(
        issues,
        "missing_limitations",
        "warning",
        "Odborný článek výslovně nepopisuje limity nebo nejistoty evidence."
      );
    }
    if (
      !hasHeadingOrPhrase(content, [
        /\b(klinický význam|dopad do praxe|dopad do klinické praxe|pro klinickou praxi|co se mění v praxi)\b/i,
      ])
    ) {
      pushIssue(
        issues,
        "missing_clinical_relevance",
        "warning",
        "Odborný článek nemá jasně oddělený klinický dopad."
      );
    }
    if (
      !hasHeadingOrPhrase(content, [
        /\b(primární zdroj|evidence|výsledky studie|metodika|design studie)\b/i,
        /původní publikace/i,
        /původní článek/i,
        /primární evidence/i,
        /redakční interpretace/i,
        /narativní přehled/i,
      ])
    ) {
      pushIssue(
        issues,
        "unclear_evidence_boundary",
        "warning",
        "Není zřejmé, co pochází ze zdroje a co je redakční interpretace."
      );
    }
  }

  let safeMetadataPatch: Record<string, unknown> | null = null;
  if (
    sourceUrlValid &&
    (!citation || !citationNameValid || !citationUrlValid)
  ) {
    safeMetadataPatch = {
      source_citation: {
        ...(citation ?? {}),
        name: citationNameValid
          ? String(citation?.name).trim()
          : deriveSourceName(article.source_name, String(article.source_url)),
        url: citationUrlValid ? citation?.url : article.source_url,
      },
    };
  } else if (
    originalEditorial &&
    (!citationNameValid || article.metadata?.original_editorial !== true)
  ) {
    safeMetadataPatch = {
      original_editorial: true,
      origin: "medscopeglobal",
      source_citation: {
        ...(citation ?? {}),
        name: "Redakce MedScopeGlobal",
        type: "original_editorial",
      },
    };
  }

  const scorePenalty = issues.reduce((sum, issue) => {
    return sum + (issue.severity === "critical" ? 25 : issue.severity === "warning" ? 10 : 3);
  }, 0);
  const severe = issues.some((issue) => issue.severity === "critical");

  return {
    id: article.id,
    slug: String(article.slug ?? ""),
    title,
    wordCount,
    score: Math.max(0, 100 - scorePenalty),
    physicianAudience,
    issues,
    severe,
    safeMetadataPatch,
  };
}

const LISTING_HIDE_CODES = new Set([
  "stub_content",
  "boilerplate_or_fallback",
  "czech_display_quality",
]);

export function shouldHideFromPublicListing(
  article: AuditableArticle,
  now = new Date()
): boolean {
  return auditArticle(article, now).issues.some((issue) =>
    LISTING_HIDE_CODES.has(issue.code)
  );
}

export function shouldQuarantineFromPublication(
  article: AuditableArticle,
  now = new Date()
): boolean {
  const result = auditArticle(article, now);
  const codes = new Set(result.issues.map((issue) => issue.code));
  return (
    codes.has("stub_content") ||
    codes.has("czech_display_quality") ||
    codes.has("boilerplate_or_fallback")
  );
}

const LIMITATIONS_HTML = `<h2>Limity a nejistoty</h2>
<p>Tento text je redakční syntéza MedScopeGlobal, nikoli klinické doporučení ani lékařská kontrola. Konkrétní čísla, autoři, identifikátory zdrojů, guideline a závěry platí jen tehdy, jsou-li uvedeny v primárním zdroji tohoto záznamu. Chybějící údaj redakce nedoplňuje.</p>`;

const EVIDENCE_BOUNDARY_HTML = `<h2>Primární evidence a redakční interpretace</h2>
<p>Údaje převzaté z primárního zdroje jsou odděleny od interpretace redakce MedScopeGlobal. The Lancet, The Lancet Rheumatology a další časopisy jsou citované zdroje, nikoli partneři ani schvalovatelé tohoto textu. Redakce nevymýšlí výsledky studií, doporučení ani bibliografické údaje.</p>`;

const CLINICAL_RELEVANCE_HTML = `<h2>Dopad do klinické praxe</h2>
<p>Změna diagnostického nebo léčebného postupu vyplývá jen z uvedeného primárního zdroje a lokálního doporučení. Tento článek sám o sobě praxi nemění.</p>`;

const ORIGINAL_SOURCE_HTML = `<h2>Zdroje</h2>
<p>Původní redakční a výukový text desk MedScopeGlobal. Nejde o přepis cizího časopisu ani o citaci konkrétní studie. Externí URL, identifikátory zdrojů ani guideline v tomto záznamu nejsou a redakce je nedoplňuje.</p>`;

export function extractExistingDoi(article: AuditableArticle): string | null {
  const citation = metadataCitation(article.metadata);
  const haystack = [
    article.content,
    article.excerpt,
    article.source_url,
    citation?.doi,
    citation?.url,
    article.metadata?.primary_doi,
  ]
    .map((value) => String(value ?? ""))
    .join(" ");
  return haystack.match(/\b10\.\d{4,9}\/[-._;()/:A-Z0-9]+/i)?.[0] ?? null;
}

export function buildSafeEditorialAppend(
  article: AuditableArticle,
  now = new Date()
): string | null {
  const audit = auditArticle(article, now);
  const codes = new Set(audit.issues.map((issue) => issue.code));
  const parts: string[] = [];
  if (codes.has("missing_limitations")) parts.push(LIMITATIONS_HTML);
  if (codes.has("unclear_evidence_boundary")) parts.push(EVIDENCE_BOUNDARY_HTML);
  if (codes.has("missing_clinical_relevance")) parts.push(CLINICAL_RELEVANCE_HTML);
  if (codes.has("missing_source_section")) {
    parts.push(buildVerifiedSourceSection(article) ?? ORIGINAL_SOURCE_HTML);
  } else if (
    isOriginalMedScopeEditorial(article) &&
    !/původní redakční|desk medscopeglobal|redakce medscopeglobal/i.test(
      String(article.content ?? "")
    )
  ) {
    parts.push(ORIGINAL_SOURCE_HTML);
  }
  return parts.length ? parts.join("\n") : null;
}

export function clampFuturePublishedAt(
  article: AuditableArticle,
  now = new Date()
): string | null {
  if (!article.published_at) return now.toISOString();
  const publishedAt = new Date(article.published_at);
  if (Number.isNaN(publishedAt.getTime()) || publishedAt.getTime() > now.getTime() + 15 * 60 * 1000) {
    const createdAt = article.created_at ? new Date(article.created_at) : null;
    if (createdAt && !Number.isNaN(createdAt.getTime()) && createdAt.getTime() <= now.getTime()) {
      return createdAt.toISOString();
    }
    return now.toISOString();
  }
  return null;
}

export function buildVerifiedSourceSection(article: AuditableArticle): string | null {
  const citation = metadataCitation(article.metadata);
  const url = isHttpUrl(citation?.url)
    ? String(citation?.url)
    : isHttpUrl(article.source_url)
      ? article.source_url
      : null;
  if (!url) return null;
  const name = citationNameOrFallback(citation, article.source_name, url);
  const safeName = escapeHtml(name);
  const safeUrl = escapeHtml(url);
  return `<h2>Zdroje</h2><ul><li><a href="${safeUrl}" target="_blank" rel="noopener noreferrer">${safeName}</a></li></ul>`;
}

function citationNameOrFallback(
  citation: Record<string, unknown> | null,
  sourceName: unknown,
  sourceUrl: string
): string {
  if (typeof citation?.name === "string" && citation.name.trim().length >= 2) {
    return citation.name.trim();
  }
  return deriveSourceName(sourceName, sourceUrl);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function summarizeArticleAudits(results: ArticleAuditResult[]) {
  const issueCounts: Record<string, number> = {};
  for (const result of results) {
    for (const issue of result.issues) {
      issueCounts[issue.code] = (issueCounts[issue.code] ?? 0) + 1;
    }
  }
  return {
    audited: results.length,
    passing: results.filter((result) => result.issues.length === 0).length,
    flagged: results.filter((result) => result.issues.length > 0).length,
    severe: results.filter((result) => result.severe).length,
    physician: results.filter((result) => result.physicianAudience).length,
    safeMetadataRepairs: results.filter((result) => result.safeMetadataPatch).length,
    issueCounts,
  };
}
