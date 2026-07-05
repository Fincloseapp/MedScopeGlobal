import { academyGenerateJson } from "@/lib/academy/ai/workers/shared";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { pickAvatarForCategory, getPublicAvatar } from "@/lib/verejnost/osveta/avatars";
import { insertPublicHealthVideo } from "@/lib/verejnost/osveta/db";
import { renderPublicOsvetaVideo } from "@/lib/verejnost/osveta/video-render";
import { buildVideoEditorialMetadataPatch } from "@/lib/editorial/video-units";
import type { PublicHealthCategory } from "@/types/public-osveta";

export type DailyOsvetaGenerationResult = {
  skipped: boolean;
  reason?: string;
  videoId?: string;
  slug?: string;
  title?: string;
  topicSlug?: string;
  renderProvider?: string;
};

const TRENDING_TOPICS: Array<{ slug: string; title: string; category: PublicHealthCategory }> = [
  { slug: "diabetes-prevence", title: "Diabetes — prevence v každodenním životě", category: "nemoc" },
  { slug: "srdeci-zdravi", title: "Srdce v kondici: jednoduché návyky", category: "prevence" },
  { slug: "spanek-kvalita", title: "Spánek: jak zlepšit kvalitu od dneška", category: "zivotni-styl" },
  { slug: "ockovani-aktualne", title: "Očkování — co potřebujete vědět", category: "prevence" },
  { slug: "hypertension", title: "Vysoký tlak: tichý nepřítel", category: "nemoc" },
  { slug: "pohyb-kazdy-den", title: "Pohyb každý den — i 10 minut stačí", category: "zivotni-styl" },
  { slug: "mozek-zdravi", title: "Mozek a paměť: výživa a pohyb", category: "dlouhovekost" },
  { slug: "healthspan-zaklady", title: "Healthspan — více zdravých let", category: "dlouhovekost" },
  { slug: "biomarkery-prevence", title: "Biomarkery, které stojí za sledování", category: "dlouhovekost" },
  { slug: "sarkopenie-prevence", title: "Svaly v každém věku — prevence úbytku", category: "dlouhovekost" },
  { slug: "imunita-posileni", title: "Imunita: mýty a fakta", category: "prevence" },
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

function buildStubScript(title: string, category: string): string {
  return `Dobrý den, vítá vás zdravotní osvěta MedScopeGlobal. Dnešní téma: ${title}. V oblasti ${category} platí, že malé každodenní kroky mají větší účinek než jednorázové extrémy. Začněte jednou konkrétní změnou ještě dnes — třeba desetiminutovou procházkou nebo sklenicí vody navíc. Máte otázky? Obraťte se na praktického lékaře. Informace nenahrazují lékařskou péči.`;
}

export async function generateOsvetaScript(title: string, category: string, description: string) {
  const { data, fallback } = await academyGenerateJson<{ script: string; duration_seconds: number }>({
    system:
      "Jsi český zdravotní popularizátor pro veřejnost MedScopeGlobal. Piš přirozenou mluvenou češtinou — vykání, energicky, ale medicínsky přesně. Evropský kontext. Bez osobních jmen moderátorů. Odpovídej pouze validním JSON.",
    user: `Napiš mluvený scénář krátkého videa (60–90 sekund, max 900 znaků) na téma "${title}" (kategorie: ${category}).
Popis: ${description}

Požadavky:
- Začni pozdravem bez osobního jména (např. „Dobrý den, vítá vás zdravotní osvěta MedScopeGlobal.").
- První věta musí být hook — otázka nebo překvapivý fakt k tématu.
- Scénář musí přímo odpovídat titulku a kategorii — žádný generický obsah.
- Uveď 2–3 praktické tipy s prospěchem pro diváka.
- Tón: diplomaticky korektní, podpůrný, bez strašení.
- Ukonči výzvou k jednomu konkrétnímu kroku dnes.
- Připomeň, že informace nenahrazují lékaře.

JSON: {"script": "...", "duration_seconds": number}`,
    maxTokens: 1200,
  });

  if (fallback || !data?.script) {
    return { script: buildStubScript(title, category), duration: 75, fallback: true };
  }
  return {
    script: data.script.slice(0, 1200),
    duration: data.duration_seconds ?? 75,
    fallback: false,
  };
}

async function pickTopicForToday(): Promise<{
  topicId: string;
  slug: string;
  title: string;
  category: PublicHealthCategory;
  description: string;
} | null> {
  const admin = createServiceRoleClient();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const { data: existingToday } = await admin
    .from("public_health_videos")
    .select("id")
    .gte("published_at", todayStart.toISOString())
    .limit(1);

  if (existingToday?.length) {
    return null;
  }

  const dayIndex = Math.floor(Date.now() / 86_400_000) % TRENDING_TOPICS.length;
  const pick = TRENDING_TOPICS[dayIndex];
  const slug = slugify(`${pick.slug}-${todayStart.toISOString().slice(0, 10)}`);

  const { data: existingSlug } = await admin
    .from("public_health_videos")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (existingSlug) return null;

  let { data: topic } = await admin
    .from("public_health_topics")
    .select("*")
    .eq("slug", pick.slug)
    .maybeSingle();

  if (!topic) {
    const { data: created } = await admin
      .from("public_health_topics")
      .insert({
        slug: pick.slug,
        title: pick.title,
        description: `Denní tip — ${pick.title}`,
        category: pick.category,
        popularity_score: 70,
      })
      .select("*")
      .single();
    topic = created;
  }

  if (!topic) return null;

  return {
    topicId: topic.id,
    slug,
    title: pick.title,
    category: pick.category as PublicHealthCategory,
    description: topic.description ?? pick.title,
  };
}

export async function runDailyPublicOsvetaGeneration(): Promise<DailyOsvetaGenerationResult> {
  const topic = await pickTopicForToday();
  if (!topic) {
    return { skipped: true, reason: "video_already_exists_today" };
  }

  const avatarType = pickAvatarForCategory(topic.category);
  const avatar = getPublicAvatar(avatarType);
  const { script, duration } = await generateOsvetaScript(topic.title, topic.category, topic.description);

  const editorialMeta = buildVideoEditorialMetadataPatch({
    audience: "osveta",
    slug: topic.slug,
    category: topic.category,
    avatarType,
    aiAssisted: true,
  });

  const video = await insertPublicHealthVideo({
    topicId: topic.topicId,
    slug: topic.slug,
    title: topic.title,
    script,
    avatarType,
    durationSeconds: duration,
    thumbnailUrl: avatar.imageUrl,
    publishedAt: new Date().toISOString(),
    status: "processing",
    metadata: editorialMeta,
  });

  if (!video) {
    return { skipped: true, reason: "insert_failed" };
  }

  const render = await renderPublicOsvetaVideo({
    videoId: video.id,
    title: video.title,
    script: video.script,
    avatarType,
    durationSeconds: duration,
  });

  const admin = createServiceRoleClient();
  const quizQuestions = [
    {
      question_text: `Co je hlavní téma videa „${topic.title}"?`,
      options: [topic.category, "Sport", "Politika"],
      correct_answer: topic.category,
      explanation: "Téma odpovídá kategorii dnešního tipu.",
    },
    {
      question_text: "Nahrazuje video lékařskou péči?",
      options: ["Ano vždy", "Ne, je to osvěta", "Jen u dětí"],
      correct_answer: "Ne, je to osvěta",
      explanation: "Osvětová videa nenahrazují konzultaci s lékařem.",
    },
    {
      question_text: "Co je nejlepší první krok?",
      options: ["Extrémní dieta", "Jeden malý návyk", "Ignorovat"],
      correct_answer: "Jeden malý návyk",
      explanation: "Malé udržitelné změny fungují nejlépe.",
    },
  ];

  await admin.from("public_health_quizzes").insert({
    video_id: video.id,
    title: `Mini kvíz: ${topic.title}`,
    passing_score: 67,
    questions: quizQuestions,
  });

  return {
    skipped: false,
    videoId: video.id,
    slug: topic.slug,
    title: topic.title,
    topicSlug: topic.slug,
    renderProvider: render.render_provider,
  };
}
