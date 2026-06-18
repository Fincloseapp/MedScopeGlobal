import { academyGenerateJson } from "@/lib/academy/ai/workers/shared";

export type VideoScriptOutput = {
  script: string;
  structure: Array<{ section: string; duration_seconds: number; content: string }>;
  description: string;
  key_points: string[];
  subtitles: Array<{ start_seconds: number; end_seconds: number; text: string }>;
  expert_summary: string;
  storyboard: Array<{ scene: number; visual: string; narration: string }>;
  avatar_type: string;
  voice_type: string;
  duration_estimate_seconds: number;
};

function buildStubScript(topic: string): VideoScriptOutput {
  const script = `Vítejte u lekce „${topic}". Tato lekce vás provede klíčovými medicínskými koncepty v evropském kontextu. Na konci si ověříte znalosti v kvízu.`;
  return {
    script,
    structure: [
      { section: "Úvod", duration_seconds: 30, content: `Představení tématu: ${topic}` },
      { section: "Hlavní obsah", duration_seconds: 180, content: "Klíčové klinické informace a postupy." },
      { section: "Shrnutí", duration_seconds: 60, content: "Zopakujte si klíčové pojmy." },
    ],
    description: `Videokurz k tématu ${topic} pro studenty medicíny.`,
    key_points: ["Definice a epidemiologie", "Diagnostika", "Léčba", "Prevence"],
    subtitles: [{ start_seconds: 0, end_seconds: 30, text: script.slice(0, 120) }],
    expert_summary: `Lekce pokrývá základy tématu ${topic} podle evropských guidelines.`,
    storyboard: [
      { scene: 1, visual: "Evropský lékařský lektor", narration: `Úvod: ${topic}` },
      { scene: 2, visual: "Klinický diagram", narration: "Hlavní obsah lekce" },
      { scene: 3, visual: "Shrnutí", narration: "Klíčové body a závěr" },
    ],
    avatar_type: "european_medical_lecturer",
    voice_type: "cs_female_professional",
    duration_estimate_seconds: 300,
  };
}

export async function generateVideoScript(input: {
  topic: string;
  lessonContent?: string;
  courseTitle?: string;
  level?: string;
}): Promise<{ result: VideoScriptOutput; provider: string; fallback: boolean }> {
  const { data, provider, fallback } = await academyGenerateJson<VideoScriptOutput>({
    system:
      "Jsi expert na medicínské videokurzy pro české studenty medicíny. Piš profesionálně, evropský medicínský kontext. Odpovídej pouze validním JSON.",
    user: `Napiš kompletní scénář videa pro téma "${input.topic}" (kurz: ${input.courseTitle ?? "MedScope Academy"}, úroveň: ${input.level ?? "student"}).

${input.lessonContent ? `Obsah lekce:\n${input.lessonContent.slice(0, 2000)}` : ""}

JSON:
{
  "script": "celý mluvený text lektora (3-5 minut)",
  "structure": [{"section": "...", "duration_seconds": number, "content": "..."}],
  "description": "popis videa pro SEO",
  "key_points": ["..."],
  "subtitles": [{"start_seconds": 0, "end_seconds": 30, "text": "..."}],
  "expert_summary": "shrnutí pro odborníky",
  "storyboard": [{"scene": 1, "visual": "...", "narration": "..."}],
  "avatar_type": "european_medical_lecturer",
  "voice_type": "cs_female_professional",
  "duration_estimate_seconds": number
}`,
    maxTokens: 4000,
  });

  if (fallback || !data?.script) {
    return { result: buildStubScript(input.topic), provider, fallback: true };
  }

  return {
    result: {
      script: data.script,
      structure: data.structure ?? [],
      description: data.description ?? `Videokurz: ${input.topic}`,
      key_points: data.key_points ?? [],
      subtitles: data.subtitles ?? [],
      expert_summary: data.expert_summary ?? "",
      storyboard: data.storyboard ?? [],
      avatar_type: data.avatar_type ?? "european_medical_lecturer",
      voice_type: data.voice_type ?? "cs_female_professional",
      duration_estimate_seconds: data.duration_estimate_seconds ?? 300,
    },
    provider,
    fallback: false,
  };
}
