import { createServiceRoleClient } from "@/lib/supabase/service";
import type { PublicTopic } from "@/lib/queries/verejnost";
import { resolveArticleCoverUrl } from "@/lib/ecosystem/editorial/images/cover";

type SeedArticle = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  public_topic: PublicTopic;
  cover_image_url?: string;
  meta_description?: string;
  /** Redakční tip — zvýraznění na hubu a plně otevřený vzorový obsah. */
  editors_pick?: boolean;
  fully_open?: boolean;
  read_time_minutes?: number;
  keywords?: string[];
};

const SEED_ARTICLES: SeedArticle[] = [
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
    meta_description:
      "Praktický průvodce zdravým spánkem: režim dne, hygiena ložnice a varovné signály pro konzultaci s lékařem.",
    editors_pick: true,
    fully_open: true,
    read_time_minutes: 4,
    keywords: ["spánek", "hygiena spánku", "regenerace", "životní styl"],
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
<p><em>MedScopeGlobal · Veřejné zdraví · Obsah pro vzdělávání.</em></p>`,
    public_topic: "prevence",
    meta_description:
      "Přehled preventivních prohlídek, screeningových programů a očkování v Česku — srozumitelně pro veřejnost.",
    editors_pick: true,
    fully_open: true,
    read_time_minutes: 5,
    keywords: ["prevence", "screening", "očkování", "preventivní prohlídka"],
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
<h2>Kontakt s praktickým lékařem</h2>
<p>Přetrvávající horečka, opakující se bolesti nebo neobvyklé změny na kůži — domluvte se s praktickým lékařem.</p>
<p><em>MedScopeGlobal · Veřejné zdraví · V akutních stavech volejte 155.</em></p>`,
    public_topic: "nemoci",
    meta_description:
      "Kdy vyhledat lékaře a kdy počkat: akutní příznaky, varovné signály a praktické rady pro rozhodování.",
    editors_pick: true,
    fully_open: true,
    read_time_minutes: 4,
    keywords: ["symptomy", "první pomoc", "praktický lékař", "akutní stavy"],
  },
  {
    slug: "verejnost-rozhovor-kardiolog-prevence-srdce",
    title: "Rozhovor s kardiologem: prevence srdečních onemocnění v každodenním životě",
    excerpt:
      "Kardiolog vysvětluje, jak pohyb, strava a kontrola rizikových faktorů chrání srdce — bez strašení.",
    content: `<p><strong>MedScope:</strong> Co je nejdůležitější prevence srdečních onemocnění pro běžného člověka?</p>
<p><strong>Kardiolog:</strong> Pravidelný pohyb, kontrola krevního tlaku a cholesterolu a nekouření. Malé změny mají velký dopad.</p>
<h2>Praktické kroky</h2>
<ul>
<li>150 minut středně intenzivního pohybu týdně.</li>
<li>Omezení soli a průmyslově zpracovaných potravin.</li>
<li>Preventivní prohlídka u praktického lékaře jednou ročně.</li>
</ul>
<p><em>MedScopeGlobal · Rozhovory · Informace nenahrazují vyšetření u kardiologa.</em></p>`,
    public_topic: "rozhovory",
    meta_description:
      "Rozhovor s kardiologem o prevenci infarktu a mrtvice: pohyb, strava, tlak a cholesterol srozumitelně.",
    editors_pick: true,
    fully_open: true,
    read_time_minutes: 6,
    keywords: ["kardiologie", "prevence", "srdce", "rozhovor"],
  },
  {
    slug: "verejnost-zivotni-styl-vyziva-bez-extremu",
    title: "Vyvážená strava bez extrémů: středomořský talíř v české kuchyni",
    excerpt:
      "Zapomeňte na drastické diety. Středomořský talíř jde skvěle přeložit do české kuchyně — s olivovým olejem, zeleninou sezóny a realistickým týdenním plánem.",
    content: `<p>Večer po směně stojíte u lednice a řešíte klasiku: ohřát knedlíky, objednat něco rychlého, nebo zkusit jíst „zdravě“ a zase skončit u pocitu, že to nejde. Právě tady dává smysl středomořský talíř — ne jako dovolená v Řecku, ale jako praktický model, jak jíst sytě, pestře a bez dietního stresu v běžném českém týdnu.</p>
<h2>Co středomořský talíř opravdu znamená</h2>
<p>Nejde o jednu recepturu. Jde o poměr: hodně zeleniny a ovoce, celozrnné přílohy, luštěniny, ryby a kvalitní tuky (hlavně olivový olej), méně průmyslově zpracovaných potravin a slazených nápojů. Maso může zůstat — spíš jako příloha než jako jediná hvězda talíře. Alkohol není nutný; pokud ho pijete, držte ho v rozumné míře a ne jako „zdravotní tip“.</p>
<p>Pro české podmínky je důležité přiznání: nemáme celoroční farmářské trhy plné rajčat. Máme zimu, směny, školku a obědy v jídelně. Proto vyhrává adaptace — mražená zelenina, konzervovaná cizrna, pečená zelenina na plechu a jeden jednoduchý recept, který zvládnete i unavení.</p>
<h2>Jak vypadá talíř v praxi (ne na Instagramu)</h2>
<ul>
<li>Polovina talíře: zelenina (čerstvá, mražená nebo pečená).</li>
<li>Čtvrtina: celozrnná příloha (kroupy, pohanka, celozrnná rýže, kvalitní chléb).</li>
<li>Čtvrtina: bílkovina (ryba, luštěniny, vejce, jogurt, libovější maso).</li>
<li>Tuk: lžíce olivového oleje, hrst ořechů, semínka — ne litr omáčky.</li>
</ul>
<p>Příklad večere po práci: pečená zelenina s cizrnou, hrst kroupů a jogurt s bylinkami. Příklad oběda z „české“ kuchyně: guláš s menší porcí masa, víc zeleniny a celozrnnou přílohou místo hromady knedlíků — chuť zůstane, poměr se posune.</p>
<h2>Nákupní seznam, který vydrží týden</h2>
<p>Základ do košíku: sezónní nebo mražená zelenina, cibule, česnek, rajčata (i pasírovaná), luštěniny ve skle, celozrnné přílohy, vejce, bílý jogurt, tuňák nebo mražené ryby, olivový olej, ořechy, citron, bylinky. „Radost“ nechte v rozpočtu — kousek sýra, dobrý chléb, ovoce — ať plán nevypadá jako trest.</p>
<ul>
<li>70 % základ, který uvaříte opakovaně.</li>
<li>20 % sezónní novinky (řepa, dýně, chřest, jahody…).</li>
<li>10 % drobná radost bez výčitek.</li>
</ul>
<h2>Týdenní plán bez pondělního restartu</h2>
<p>Pondělí a úterý: jedna změna — například zelenina k večeři vždycky. Středa a čtvrtek: stejnou změnu jen udržte. Pátek: krátké zhodnocení. Víkend: jedno pečené jídlo na více porcí. Když týden selže, vraťte se k nejmenší verzi (zelenina + bílkovina), ne k nule.</p>
<p>Pro rodiny funguje „jedno jídlo, různé přílohy“: někdo dostane víc zeleniny, někdo víc přílohy, děti mohou mít známou chuť s menší úpravou. Nemusíte vařit dvě úplně jiná jídla.</p>
<h2>Časté mýty</h2>
<p><strong>Mýtus:</strong> „Musím jíst jen ryby a saláty.“ <strong>Realita:</strong> luštěniny, vejce, jogurt a občasné maso jsou v pořádku — důležitý je celkový poměr a pravidelnost.</p>
<p><strong>Mýtus:</strong> „Bez drahých superpotravin to nemá cenu.“ <strong>Realita:</strong> základní český nákup stačí. Olivový olej pomůže, ale rozhoduje pestrost a méně sladkých nápojů.</p>
<p><strong>Mýtus:</strong> „Buď dietuji naprosto správně, nebo to vzdám.“ <strong>Realita:</strong> 70 % dodržení plánu často vydá víc než týden perfekcionismu a pak návrat ke starým návykům.</p>
<h2>Kdy dává smysl mluvit s lékařem nebo nutričním terapeutem</h2>
<p>Při chronickém onemocnění (cukrovka, onemocnění ledvin, trávicí potíže), při nechtěném hubnutí, dlouhodobé únavě nebo pokud užíváte léky, které ovlivňují stravu, konzultujte změnu s odborníkem. Článek nenahrazuje vyšetření ani individuální doporučení.</p>
<h2>Zdroje</h2>
<ul>
<li>WHO — healthy diet recommendations</li>
<li>SZÚ / odborné výživové doporučení pro veřejnost</li>
<li>MedScopeGlobal redakce — praktická adaptace pro české domácnosti</li>
</ul>
<p><em>MedScopeGlobal · Životní styl · Informace nenahrazují individuální lékařskou péči.</em></p>`,
    public_topic: "zivotni-styl",
    meta_description:
      "Vyvážená strava bez extrémů: středomořský talíř v české kuchyni — nákupní seznam, týdenní plán a mýty vs. realita.",
    read_time_minutes: 9,
    keywords: ["výživa", "strava", "středomořská dieta", "životní styl", "česká kuchyně"],
  },
];

function buildArticleMetadata(article: SeedArticle) {
  return {
    editorial_version: "26",
    section: "verejnost",
    editors_pick: article.editors_pick ?? false,
    fully_open: article.fully_open ?? true,
    read_time_minutes: article.read_time_minutes ?? 5,
    keywords: article.keywords ?? [],
    seed: true,
  };
}

export async function seedPublicArticlesIfEmpty(): Promise<{ seeded: number; skipped: boolean }> {
  const admin = createServiceRoleClient();
  const { count } = await admin
    .from("articles")
    .select("id", { count: "exact", head: true })
    .eq("audience", "public")
    .eq("published", true);

  if ((count ?? 0) > 0) return { seeded: 0, skipped: true };

  const { data: cat } = await admin.from("categories").select("id").limit(1).maybeSingle();
  if (!cat?.id) return { seeded: 0, skipped: false };

  let authorId = process.env.INGESTION_AUTHOR_ID ?? null;
  if (!authorId) {
    const { data: userRow } = await admin.from("users").select("id").eq("role", "admin").limit(1).maybeSingle();
    authorId = userRow?.id ?? null;
  }
  if (!authorId) return { seeded: 0, skipped: false };

  let seeded = 0;
  const now = new Date().toISOString();

  for (const article of SEED_ARTICLES) {
    const { data: existing } = await admin.from("articles").select("id").eq("slug", article.slug).maybeSingle();
    if (existing?.id) continue;

    const { error } = await admin.from("articles").insert({
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      content: article.content,
      cover_image_url:
        article.cover_image_url ??
        resolveArticleCoverUrl({
          title: article.title,
          slug: article.slug,
          excerpt: article.excerpt,
          publicTopic: article.public_topic,
          preferCurated: true,
        }),
      category_id: cat.id,
      author_id: authorId,
      published: true,
      published_at: now,
      vip_only: false,
      rubric_slug: "verejnost",
      min_access_level: "public",
      locale: "cs",
      audience: "public",
      public_topic: article.public_topic,
      source_name: "MedScopeGlobal · Veřejné zdraví",
      meta_description: article.meta_description ?? article.excerpt.slice(0, 160),
      ai_generated: false,
      metadata: buildArticleMetadata(article),
    });

    if (!error) seeded += 1;
  }

  return { seeded, skipped: false };
}
