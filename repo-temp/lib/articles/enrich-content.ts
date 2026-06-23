import type { ArticleWithRelations } from "@/types/database";

type EnrichableArticle = Pick<
  ArticleWithRelations,
  "title" | "excerpt" | "content"
> & {
  learning_objectives?: string[] | null;
  reading_time_minutes?: number | null;
  med_track?: string | null;
  study_year?: number | null;
};

const MIN_RICH_CHARS = 420;

/** Build fuller HTML for editorial / med-education articles with short stored bodies. */
export function enrichArticleHtml(article: EnrichableArticle): string {
  const body = article.content?.trim() ?? "";
  if (stripHtml(body).length >= MIN_RICH_CHARS) {
    return body;
  }

  const lead = article.excerpt?.trim() || "";
  const objectives = Array.isArray(article.learning_objectives)
    ? article.learning_objectives.filter(Boolean)
    : [];

  const sections: string[] = [];

  if (lead) {
    sections.push(`<p class="lead text-lg leading-8 text-slate-700">${escapeHtml(lead)}</p>`);
  }

  if (body) {
    sections.push(body.startsWith("<") ? body : `<p>${escapeHtml(body)}</p>`);
  } else if (lead) {
    sections.push(
      `<p>${escapeHtml(lead)} RozĹˇiĹ™te si pĹ™ehled krok za krokem â€” nĂ­Ĺľe najdete strukturovanĂ© shrnutĂ­ pro praxi i studium.</p>`
    );
  }

  if (objectives.length > 0) {
    sections.push(
      `<h2>ÄŚemu se v ÄŤlĂˇnku vÄ›nujeme</h2><ul>${objectives
        .map((item) => `<li>${escapeHtml(item)}</li>`)
        .join("")}</ul>`
    );
  }

  if (article.med_track === "priprava") {
    sections.push(
      `<h2>StudijnĂ­ plĂˇn na tĂ˝den</h2>
      <p>StrukturovanĂˇ pĹ™Ă­prava na lĂ©kaĹ™skou fakultu funguje nejlĂ©pe, kdyĹľ stĹ™Ă­dĂˇte opakovĂˇnĂ­, Ĺ™eĹˇenĂ­ otĂˇzek a reflexi chyb.</p>
      <ol>
        <li><strong>PondÄ›lĂ­â€“stĹ™eda:</strong> 30â€“45 minut dennÄ› na opakovĂˇnĂ­ biologie, chemie a fyziky podle vlastnĂ­ch mezer.</li>
        <li><strong>ÄŚtvrtek:</strong> jeden modelovĂ˝ test v ÄŤasovĂ©m limitu, zĂˇpis chyb do seĹˇitu.</li>
        <li><strong>PĂˇtek:</strong> skupinovĂ© Ĺ™eĹˇenĂ­ otĂˇzek nebo peer review odpovÄ›dĂ­.</li>
        <li><strong>VĂ­kend:</strong> lehkĂ© opakovĂˇnĂ­ + krĂˇtkĂˇ reflexe: co Ĺˇlo, co zopakovat pĹ™Ă­ĹˇtĂ­ tĂ˝den.</li>
      </ol>`
    );
  }

  if (article.med_track === "studium") {
    const year = article.study_year ? `${article.study_year}. roÄŤnĂ­k` : "studium medicĂ­ny";
    sections.push(
      `<h2>Jak ÄŤĂ­st odbornĂ˝ text v ${year}</h2>
      <p>KlinickĂ© studie a review ÄŤlĂˇnky majĂ­ stejnou logiku: nejdĹ™Ă­v pochopit otĂˇzku, pak metodiku, vĂ˝sledky a klinickĂ˝ dopad.</p>
      <h3>PraktickĂ˝ postup</h3>
      <ul>
        <li><strong>Abstrakt:</strong> jakĂˇ byla hlavnĂ­ otĂˇzka a co autoĹ™i mÄ›Ĺ™ili.</li>
        <li><strong>Metodika:</strong> kohorty, randomizace, sledovĂˇnĂ­, moĹľnĂ© biasy.</li>
        <li><strong>VĂ˝sledky:</strong> statistickĂˇ i klinickĂˇ vĂ˝znamnost â€” nejsou totĂ©Ĺľ.</li>
        <li><strong>ZĂˇvÄ›r:</strong> co to znamenĂˇ pro konkrĂ©tnĂ­ho pacienta nebo pro dalĹˇĂ­ vĂ˝uku.</li>
      </ul>
      <p>Po pĹ™eÄŤtenĂ­ si formulujte jednu vÄ›tu: â€žTato studie mÄ› nauÄŤila, Ĺľeâ€¦â€ś â€” pokud ji neumĂ­te napsat, vraĹĄte se k vĂ˝sledkĹŻm.</p>`
    );
  }

  if (article.reading_time_minutes) {
    sections.push(
      `<p class="text-sm text-slate-500">OdhadovanĂˇ doba ÄŤtenĂ­: ${article.reading_time_minutes} min.</p>`
    );
  }

  return sections.join("\n");
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
