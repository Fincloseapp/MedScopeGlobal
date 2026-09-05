import { appendMagazineDepthSections, getSupabaseAdmin } from "./writer-base.mjs";

const TODAY_ISO = () => new Date().toISOString().slice(0, 10);

/**
 * Weaker same-day duplicates — keep the later, on-seed piece.
 * Czech: generic wellness + first osteo wave.
 * Slovak: first wave of the same three prevence seeds.
 */
export const CS_UNPUBLISH_SLUGS = [
  "verejnost-prevence-2026-09-04-mentalni-prevence-a-dusevni-pohoda-senioru-kdy-a-jak-vyhledat-odbornou-pomoc",
  "verejnost-prevence-2026-09-04-osteoporoza-v-akci-jak-se-na-ni-pripravit-v-kazde-sezone-vapnik-vitamin-d-a-pohy",
];

export const SK_UNPUBLISH_SLUGS = [
  "verejnost-sk-prevence-2026-09-04-mentalna-prevencia-a-dusevna-pohoda-kedy-vyhladat-odbornu-pomoc-a-ako-ju-podpori",
  "verejnost-sk-prevence-2026-09-04-screening-rakoviny-v-slovenskej-republike-ako-a-kedy-zacat",
  "verejnost-sk-prevence-2026-09-04-osteoporoza-proaktivna-starostlivost-o-kostnu-hustotu-u-muzov-a-zien",
];

export function stripInventedProjectNames(html) {
  return String(html || "")
    .replace(/projekt(?:u|em|e)?\s+Mammo[‑\-]?Czech/gi, "oficiální screeningový program")
    .replace(/Mammo[‑\-]?Czech/gi, "oficiální screening")
    .replace(/\s{2,}/g, " ");
}

export function hedgeInventedScreeningStats(html) {
  return String(html || "")
    .replace(
      /70\s*%\s+případů\s+rakoviny\s+prsu\.?\s*60\s*%\s+kolorektální[^.]*90\s*%\s+rakoviny\s+děložního\s+čípku[^.]*\./gi,
      "časný záchyt může změnit další postup — konkrétní přínos se liší podle typu nádoru a stadia, proto čísla z webu neberte jako osobní prognózu.",
    )
    .replace(
      /asi\s+70\s*%\s+žen\s+nad\s+50\s+let\s+v\s+Česku\s+absolvuje\s+mamografický\s+screening/gi,
      "účast v mamografickém screeningu není automatická — věk a interval ověřte u praktického lékaře nebo zdravotní pojišťovny",
    )
    .replace(
      /asi\s+60\s*%\s+žen\s+nad\s+50\s+let/gi,
      "účast se liší podle věku, regionu a pojišťovny",
    )
    .replace(
      /až\s+90\s*%\s+případů\s+rakoviny/gi,
      "časný záchyt může změnit další postup",
    )
    .replace(
      /přibližně\s+90\s*%\s+zdravotnických\s+zařízeních/gi,
      "ordinacích a centrech, které se na screening specializují — dostupnost termínů se liší podle regionu",
    )
    .replace(
      /90\s*%\s+zdravotnických\s+zařízení(?:ch)?/gi,
      "dostupnost termínů se liší podle regionu",
    );
}

export function deHypeOsteoCopy(text) {
  return String(text || "")
    .replace(/zachraňují kosti/gi, "pomáhají kostem")
    .replace(/,? které mění pravidla hry\.?/gi, ".")
    .replace(/Připravte se na revoluci v prevenci osteoporózy\.?/gi, "Prevence osteoporózy stojí na výživě, pohybu a kontrole u lékaře.")
    .replace(/\brevoluci\b/gi, "posun")
    .replace(/\s+\./g, ".")
    .replace(/\.\./g, ".");
}

export function retitleGenericWellness(title, slug) {
  const t = String(title || "").trim();
  const s = String(slug || "");
  if (/jak zlepšit zdraví bez stresu/i.test(t) && /mentalni-prevence|mentální-prevence/i.test(s)) {
    return "Mentální prevence seniorů: kdy stačí rozhovor a kdy vyhledat pomoc";
  }
  return t;
}

export function stripCzechPracticePad(html) {
  return String(html || "").replace(
    /<h2>\s*Týdenní plán v české praxi\s*<\/h2>[\s\S]*?(?=<h2>|$)/gi,
    "",
  );
}

export function localizeSourcesHeading(html, locale) {
  const body = String(html || "");
  if (locale === "sk" || locale === "cs") {
    return body.replace(/<h2>\s*Sources\s*<\/h2>/gi, "<h2>Zdroje</h2>");
  }
  return body.replace(/<h2>\s*Zdroje\s*<\/h2>/gi, "<h2>Sources</h2>");
}

export function undoCzechPolishLeak(html, locale) {
  if (locale !== "sk") return String(html || "");
  return String(html || "")
    .replace(/\bpři\b/g, "pri")
    .replace(/(?<!\p{L})článek(?!\p{L})/gu, "článok")
    .replace(/(?<!\p{L})článku(?!\p{L})/gu, "článku")
    .replace(/(?<!\p{L})články(?!\p{L})/gu, "články")
    .replace(/Ministerstvo zdravotnictví ČR/g, "Ministerstvo zdravotníctva SR")
    .replace(/\bÚZIS(?: ČR)?\b/g, "NCZI")
    .replace(/praktického lékaře/g, "všeobecného lekára");
}

export function repairCzechPublicArticle(row) {
  const slug = String(row.slug || "");
  let title = retitleGenericWellness(row.title, slug);
  let excerpt = String(row.excerpt || "");
  let content = String(row.content || "");

  if (/osteoporoza-na-dosah|Osteoporóza na dosah/i.test(`${slug} ${title}`)) {
    title = deHypeOsteoCopy(title);
    excerpt = deHypeOsteoCopy(excerpt);
    content = deHypeOsteoCopy(content);
  }

  if (/screening-rakoviny|Screening rakoviny/i.test(`${slug} ${title}`)) {
    content = hedgeInventedScreeningStats(stripInventedProjectNames(content));
    excerpt = hedgeInventedScreeningStats(stripInventedProjectNames(excerpt));
    title = stripInventedProjectNames(title);
  }

  content = localizeSourcesHeading(content, "cs");
  return { title, excerpt, content };
}

export function repairSlovakPublicArticle(row) {
  let title = String(row.title || "");
  let excerpt = undoCzechPolishLeak(String(row.excerpt || ""), "sk");
  let content = undoCzechPolishLeak(String(row.content || ""), "sk");
  content = stripCzechPracticePad(content);
  content = localizeSourcesHeading(content, "sk");
  if (!/<h2>[^<]*Týždenný plán/i.test(content)) {
    content = appendMagazineDepthSections(content, { locale: "sk", title });
  }
  return { title, excerpt, content };
}

export function shouldUnpublishDuplicate(slug, locale = "cs") {
  const s = String(slug || "");
  if (locale === "sk") return SK_UNPUBLISH_SLUGS.includes(s);
  return CS_UNPUBLISH_SLUGS.includes(s);
}

/**
 * Admin-only. Called at the start of the public-writer cron so the next
 * slot can clean today's already-published rows without a one-off token.
 */
export async function runTodayPublicArticleRepairs({ day = TODAY_ISO() } = {}) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return { day, scanned: 0, repaired: [], unpublished: [], skipped: "no_supabase" };
  }
  const from = `${day}T00:00:00.000Z`;
  const to = `${day}T23:59:59.999Z`;
  const { data, error } = await supabase
    .from("articles")
    .select("id, slug, title, excerpt, content, locale, published, published_at, metadata")
    .eq("published", true)
    .eq("audience", "public")
    .gte("published_at", from)
    .lte("published_at", to);

  if (error) throw new Error(`repair-load-failed:${error.message}`);

  const repaired = [];
  const unpublished = [];

  for (const row of data || []) {
    const locale = String(row.locale || "cs").toLowerCase();
    if ((locale === "cs" || locale === "sk") && shouldUnpublishDuplicate(row.slug, locale)) {
      const { error: upErr } = await supabase
        .from("articles")
        .update({
          published: false,
          metadata: {
            ...(row.metadata && typeof row.metadata === "object" ? row.metadata : {}),
            unpublished_reason: "same-day-seed-duplicate",
            repaired_at: new Date().toISOString(),
          },
        })
        .eq("id", row.id);
      if (upErr) throw new Error(`repair-unpublish-failed:${row.slug}:${upErr.message}`);
      unpublished.push(row.slug);
      continue;
    }

    const next =
      locale === "cs"
        ? repairCzechPublicArticle(row)
        : locale === "sk"
          ? repairSlovakPublicArticle(row)
          : null;
    if (!next) continue;

    const changed =
      next.title !== row.title ||
      next.excerpt !== row.excerpt ||
      next.content !== row.content;
    if (!changed) continue;

    const { error: saveErr } = await supabase
      .from("articles")
      .update({
        title: next.title,
        excerpt: next.excerpt,
        content: next.content,
        metadata: {
          ...(row.metadata && typeof row.metadata === "object" ? row.metadata : {}),
          repaired_at: new Date().toISOString(),
          repaired_by: "today-public-repair",
        },
      })
      .eq("id", row.id);
    if (saveErr) throw new Error(`repair-save-failed:${row.slug}:${saveErr.message}`);
    repaired.push(row.slug);
  }

  return { day, scanned: (data || []).length, repaired, unpublished };
}
