import { academyGenerateJson } from "@/lib/academy/ai/workers/shared";

export type CourseMetadata = {
  seo_title: string;
  seo_description: string;
  keywords: string[];
  key_points: string[];
  estimated_hours: number;
  difficulty_label: string;
  target_audience: string;
  language: string;
};

function buildStaticMetadata(input: {
  title: string;
  description: string;
  topic: string;
  level: string;
  audience: string;
}): CourseMetadata {
  return {
    seo_title: `${input.title} | MedScope Academy`,
    seo_description: input.description.slice(0, 160),
    keywords: [input.topic, "medicína", "kurz", input.level, input.audience].filter(Boolean),
    key_points: ["Teoretické základy", "Klinická aplikace", "Kvízy pro ověření znalostí"],
    estimated_hours: 2,
    difficulty_label: input.level,
    target_audience: input.audience,
    language: "cs",
  };
}

export async function buildCourseMetadata(input: {
  title: string;
  description: string;
  topic: string;
  level: string;
  audience: string;
}): Promise<CourseMetadata> {
  const { data, fallback } = await academyGenerateJson<CourseMetadata>({
    system: "Jsi SEO expert pro medicínské vzdělávání. Odpovídej pouze validním JSON.",
    user: `Metadata pro kurz:
Titulek: ${input.title}
Popis: ${input.description}
Téma: ${input.topic}
Úroveň: ${input.level}
Audience: ${input.audience}

JSON:
{
  "seo_title": "...",
  "seo_description": "...",
  "keywords": ["..."],
  "key_points": ["..."],
  "estimated_hours": number,
  "difficulty_label": "...",
  "target_audience": "...",
  "language": "cs"
}`,
    maxTokens: 800,
  });

  if (fallback || !data) return buildStaticMetadata(input);
  return { ...buildStaticMetadata(input), ...data };
}
