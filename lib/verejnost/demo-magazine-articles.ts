/**
 * In-memory magazine demo articles — used when Supabase is unavailable
 * (placeholder credentials) or the articles table is empty.
 *
 * Content mirrors `seed-public-articles.ts` / `seed-articles.ts` so Cloud Agent
 * and production-empty states still show a working VitaScope magazine feed.
 */
import type { DisplayArticle } from "@/lib/articles/prepare-for-display";
import { assignEditorialUnits, formatEditorialUnitDisplay } from "@/lib/editorial/units";
import { resolveArticleCoverUrl } from "@/lib/ecosystem/editorial/images/cover";
import type { ArticleWithRelations } from "@/types/database";

type DemoSeed = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  public_topic: "zivotni-styl" | "nemoci" | "prevence" | "rozhovory";
  /** Desk hints for homepage news columns */
  deskHint?: "novinky" | "dlouhovekost" | "verejnost" | "clanky";
  meta_description?: string;
  keywords?: string[];
  read_time_minutes?: number;
};

const DEMO_SEEDS: DemoSeed[] = [
  {
    slug: "verejnost-zivotni-styl-zdravy-spanek",
    title: "Zdravý spánek: praktické rady pro každodenní režim",
    excerpt:
      "Jak si nastavit režim dne, hygienu spánku a kdy vyhledat lékaře — srozumitelně pro každého.",
    content: `<p>Kvalitní spánek ovlivňuje imunitu, náladu i schopnost soustředit se. Není potřeba složitých postupů — stačí několik konkrétních kroků.</p>
<h2>Pravidelný režim</h2>
<p>Usínejte a vstávejte přibližně ve stejnou dobu i o víkendu. Tělo si lépe udrží biologické hodiny.</p>
<h2>Prostředí ložnice</h2>
<ul>
<li>Temná, tichá a chladnější místnost (cca 18–20 °C).</li>
<li>Omezte obrazovky hodinu před spaním.</li>
<li>Kofein a alkohol nejlépe ukončit několik hodin před spánkem.</li>
</ul>
<p><em>Informace nenahrazují lékařskou péči. Při dlouhodobých poruchách spánku kontaktujte praktického lékaře.</em></p>`,
    public_topic: "zivotni-styl",
    deskHint: "dlouhovekost",
    meta_description:
      "Praktický průvodce zdravým spánkem: režim dne, hygiena ložnice a varovné signály.",
    keywords: ["spánek", "hygiena spánku", "regenerace", "dlouhověkost"],
    read_time_minutes: 4,
  },
  {
    slug: "verejnost-prevence-screening-a-ockovani",
    title: "Prevence: screening a očkování v praxi",
    excerpt:
      "Proč se vyplatí preventivní prohlídky, jaké screeningy jsou běžné a jak se orientovat v očkování.",
    content: `<p>Prevence je nejlevnější cesta ke zdraví. V Česku existuje síť preventivních programů pro různé věkové skupiny.</p>
<h2>Preventivní prohlídky</h2>
<p>Praktický lékař vás pravidelně zve na preventivní prohlídky podle věku a rizikových faktorů.</p>
<h2>Screeningové programy</h2>
<ul>
<li>Mamografický screening u žen.</li>
<li>Kolorektální screening (krev ve stolici, kolonoskopie).</li>
<li>Screening karcinomu děložního hrdla.</li>
</ul>
<p><em>VitaScope · Veřejné zdraví · Obsah pro vzdělávání.</em></p>`,
    public_topic: "prevence",
    deskHint: "verejnost",
    meta_description:
      "Přehled preventivních prohlídek, screeningových programů a očkování v Česku.",
    keywords: ["prevence", "screening", "očkování"],
    read_time_minutes: 5,
  },
  {
    slug: "verejnost-nemoci-kdy-vyhledat-lekare",
    title: "Symptomy: kdy vyhledat lékaře a kdy počkat",
    excerpt:
      "Jak rozlišit běžné příznaky od signálů, které vyžadují rychlou lékařskou pomoc.",
    content: `<p>Ne každý kašel nebo bolest hlavy znamená vážné onemocnění. Na druhou stranu některé příznaky nesmíme podceňovat.</p>
<h2>Okamžitě vyhledejte pomoc</h2>
<ul>
<li>Bolest na hrudi, dušnost v klidu.</li>
<li>Náhlá silná bolest hlavy nebo porucha řeči.</li>
<li>Silné krvácení nebo ztráta vědomí.</li>
</ul>
<p><em>VitaScope · Veřejné zdraví · V akutních stavech volejte 155.</em></p>`,
    public_topic: "nemoci",
    deskHint: "verejnost",
    meta_description: "Kdy vyhledat lékaře a kdy počkat: akutní příznaky a varovné signály.",
    keywords: ["symptomy", "první pomoc", "praktický lékař"],
    read_time_minutes: 4,
  },
  {
    slug: "verejnost-rozhovor-kardiolog-prevence-srdce",
    title: "Rozhovor s kardiologem: prevence srdečních onemocnění v každodenním životě",
    excerpt:
      "Kardiolog vysvětluje, jak pohyb, strava a kontrola rizikových faktorů chrání srdce — bez strašení.",
    content: `<p><strong>VitaScope:</strong> Co je nejdůležitější prevence srdečních onemocnění pro běžného člověka?</p>
<p><strong>Kardiolog:</strong> Pravidelný pohyb, kontrola krevního tlaku a cholesterolu a nekouření. Malé změny mají velký dopad.</p>
<h2>Praktické kroky</h2>
<ul>
<li>150 minut středně intenzivního pohybu týdně.</li>
<li>Omezení soli a průmyslově zpracovaných potravin.</li>
<li>Preventivní prohlídka u praktického lékaře jednou ročně.</li>
</ul>
<p><em>VitaScope · Rozhovory · Informace nenahrazují vyšetření u kardiologa.</em></p>`,
    public_topic: "rozhovory",
    deskHint: "clanky",
    meta_description:
      "Rozhovor s kardiologem o prevenci infarktu a mrtvice: pohyb, strava, tlak a cholesterol.",
    keywords: ["kardiologie", "prevence", "srdce", "rozhovor"],
    read_time_minutes: 6,
  },
  {
    slug: "verejnost-zivotni-styl-vyziva-bez-extremu",
    title: "Vyvážená strava bez extrémů: středomořský talíř v české kuchyni",
    excerpt:
      "Zapomeňte na drastické diety. Středomořský talíř jde skvěle přeložit do české kuchyně — s olivovým olejem, zeleninou sezóny a realistickým týdenním plánem.",
    content: `<p>Středomořský talíř není dovolená v Řecku, ale praktický model: hodně zeleniny, celozrnné přílohy, luštěniny, ryby a kvalitní tuky.</p>
<h2>Jak vypadá talíř v praxi</h2>
<ul>
<li>Polovina talíře: zelenina.</li>
<li>Čtvrtina: celozrnná příloha.</li>
<li>Čtvrtina: bílkovina.</li>
<li>Tuk: lžíce olivového oleje nebo hrst ořechů.</li>
</ul>
<p><em>VitaScope · Životní styl · Informace nenahrazují individuální lékařskou péči.</em></p>`,
    public_topic: "zivotni-styl",
    deskHint: "clanky",
    meta_description:
      "Vyvážená strava bez extrémů: středomořský talíř v české kuchyni.",
    keywords: ["výživa", "strava", "středomořská dieta", "životní styl"],
    read_time_minutes: 7,
  },
  {
    slug: "demo-dlouhovekost-healthspan-zaklady",
    title: "Healthspan: co je důkaz a co je hype v dlouhověkosti",
    excerpt:
      "Spánek, pohyb, výživa a biomarkery — praktický rámec longevity bez biohackingové magie.",
    content: `<p>Dlouhověkost není o jednom suplementu. Healthspan — roky strávené ve zdraví — stojí na spánku, pohybu, stravě a kontrole rizik.</p>
<h2>Co má silnou evidenci</h2>
<ul>
<li>Pravidelný aerobní a silový pohyb.</li>
<li>7–9 hodin kvalitního spánku.</li>
<li>Kontrola krevního tlaku, lipidů a glykémie.</li>
</ul>
<p><em>VitaScope · Dlouhověkost · Edukační obsah, ne individuální doporučení.</em></p>`,
    public_topic: "zivotni-styl",
    deskHint: "dlouhovekost",
    meta_description: "Healthspan a dlouhověkost: důkaz vs. hype, spánek, pohyb a biomarkery.",
    keywords: ["dlouhověkost", "healthspan", "longevity", "biomarkery"],
    read_time_minutes: 5,
  },
  {
    slug: "demo-novinky-prevence-v-cesku",
    title: "Novinky: prevence v Česku — co sledovat tento měsíc",
    excerpt:
      "Přehled aktuálních témat veřejného zdraví pro čtenáře VitaScope — bez senzace, s kontextem pro ČR.",
    content: `<p>Redakce VitaScope sleduje zprávy MZČR, SÚKL a mezinárodních agentur a převádí je do srozumitelného kontextu pro české čtenáře.</p>
<h2>Na co se soustředit</h2>
<ul>
<li>Sezónní očkování a respirační infekce.</li>
<li>Screeningové programy a účast veřejnosti.</li>
<li>Bezpečnost léčiv a regulační novinky SÚKL.</li>
</ul>
<p><em>VitaScope · Novinky · Krátký redakční přehled.</em></p>`,
    public_topic: "prevence",
    deskHint: "novinky",
    meta_description: "Aktuální přehled prevence a veřejného zdraví v Česku.",
    keywords: ["novinky", "prevence", "MZČR", "SÚKL"],
    read_time_minutes: 3,
  },
];

function buildDemoRow(seed: DemoSeed, index: number): ArticleWithRelations {
  const now = new Date();
  // Stagger published_at so mixFreshFeed keeps variety
  const published = new Date(now.getTime() - index * 86_400_000).toISOString();
  const id = `demo-magazine-${seed.slug}`;

  const metadata: Record<string, unknown> = {
    editorial_version: "26",
    section: seed.deskHint === "novinky" ? "novinky" : "verejnost",
    editors_pick: true,
    fully_open: true,
    read_time_minutes: seed.read_time_minutes ?? 5,
    keywords: seed.keywords ?? [],
    seed: true,
    demo: true,
  };
  if (seed.deskHint === "dlouhovekost") {
    metadata.content_pillar = "dlouhovekost";
  }

  return {
    id,
    title: seed.title,
    slug: seed.slug,
    excerpt: seed.excerpt,
    content: seed.content,
    cover_image_url: resolveArticleCoverUrl({
      title: seed.title,
      slug: seed.slug,
      excerpt: seed.excerpt,
      publicTopic: seed.public_topic,
      preferCurated: true,
    }),
    category_id: "demo-category",
    author_id: "demo-author",
    published: true,
    published_at: published,
    vip_only: false,
    rubric_slug: seed.deskHint === "novinky" ? "aktualni-zpravy" : "verejnost",
    min_access_level: "public",
    audience: "public",
    public_topic: seed.public_topic,
    locale: "cs",
    source_name: "VitaScope · Demo magazín",
    meta_description: seed.meta_description ?? seed.excerpt.slice(0, 160),
    ai_generated: false,
    metadata,
    created_at: published,
    updated_at: published,
    categories: {
      id: "demo-category",
      name:
        seed.deskHint === "dlouhovekost"
          ? "Dlouhověkost"
          : seed.deskHint === "novinky"
            ? "Novinky"
            : "Veřejné zdraví",
      slug:
        seed.deskHint === "dlouhovekost"
          ? "dlouhovekost"
          : seed.deskHint === "novinky"
            ? "novinky"
            : "verejnost",
      description: null,
      created_at: published,
    },
    users: {
      id: "demo-author",
      full_name: "Redakce VitaScope",
      avatar_url: null,
    },
  };
}

function toDisplayArticle(row: ArticleWithRelations): DisplayArticle {
  const assignment = assignEditorialUnits(row);
  return {
    ...row,
    displayLocale: "cs",
    editorialAssignment: assignment,
    editorialPrimaryLabel: formatEditorialUnitDisplay(assignment.primary, "cs", assignment.aiAssisted),
  };
}

let cached: DisplayArticle[] | null = null;

/** Full demo magazine set (DisplayArticle ready for cards and desks). */
export function getDemoMagazineArticles(): DisplayArticle[] {
  if (!cached) {
    cached = DEMO_SEEDS.map((seed, i) => toDisplayArticle(buildDemoRow(seed, i)));
  }
  return cached;
}

export function getDemoMagazineArticleBySlug(slug: string): DisplayArticle | null {
  const key = slug.trim().toLowerCase();
  return getDemoMagazineArticles().find((a) => a.slug.toLowerCase() === key) ?? null;
}

/** True when listings should fall back to demo content (no usable DB rows). */
export function shouldUseDemoMagazineArticles(fetched: unknown[] | null | undefined): boolean {
  return !fetched || fetched.length === 0;
}
