import { createServiceRoleClient } from "@/lib/supabase/service";
import type { PublicTopic } from "@/lib/queries/verejnost";
import { VEREJNOST_FALLBACK_COVER } from "@/lib/verejnost/images";

type SeedArticle = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  public_topic: PublicTopic;
  cover_image_url?: string;
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
    cover_image_url: VEREJNOST_FALLBACK_COVER,
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
    cover_image_url: VEREJNOST_FALLBACK_COVER,
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
    cover_image_url: VEREJNOST_FALLBACK_COVER,
  },
];

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
      cover_image_url: article.cover_image_url ?? null,
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
    });

    if (!error) seeded += 1;
  }

  return { seeded, skipped: false };
}
