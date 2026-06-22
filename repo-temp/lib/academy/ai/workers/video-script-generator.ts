import { academyGenerateJson } from "@/lib/academy/ai/workers/shared";

export type VideoScriptResult = {
  script: string;
  storyboard: Array<{ scene: number; visual: string; narration: string }>;
  avatar_type: string;
  voice_type: string;
  duration_estimate_seconds: number;
};

const DEFAULT_AVATAR = "european_medical_lecturer";
const DEFAULT_VOICE = "cs_female_professional";

function buildStubScript(lessonTitle: string, lessonContent: string): VideoScriptResult {
  const excerpt = lessonContent.replace(/[#*_]/g, "").slice(0, 400).trim();
  return {
    script: `Vítejte u lekce „${lessonTitle}". ${excerpt || "Tato lekce vás provede klíčovými medicínskými koncepty."} Na konci lekce si ověříte znalosti v kvízu.`,
    storyboard: [
      { scene: 1, visual: "Evropský lékařský lektor v ordinaci", narration: `Úvod do tématu: ${lessonTitle}` },
      { scene: 2, visual: "Anatomický / klinický diagram", narration: excerpt.slice(0, 200) || "Hlavní obsah lekce" },
      { scene: 3, visual: "Shrnutí a klíčové body", narration: "Zopakujte si klíčové pojmy a přejděte ke kvízu." },
    ],
    avatar_type: DEFAULT_AVATAR,
    voice_type: DEFAULT_VOICE,
    duration_estimate_seconds: 300,
  };
}

export async function generateVideoScript(input: {
  lessonTitle: string;
  lessonContent: string;
  courseTitle?: string;
}): Promise<{ result: VideoScriptResult; provider: string; fallback: boolean }> {
  const { data, provider, fallback } = await academyGenerateJson<VideoScriptResult>({
    system:
      "Jsi scenárista videokurzů pro české studenty medicíny. Piš profesionálně, evropský medicínský kontext. Odpovídej pouze validním JSON.",
    user: `Napiš scénář videa pro lekci "${input.lessonTitle}" (kurz: ${input.courseTitle ?? "MedScope Academy"}).

Obsah lekce:
${input.lessonContent.slice(0, 2000)}

JSON:
{
  "script": "celý mluvený text lektora (3-5 minut)",
  "storyboard": [{"scene": 1, "visual": "...", "narration": "..."}],
  "avatar_type": "european_medical_lecturer",
  "voice_type": "cs_female_professional",
  "duration_estimate_seconds": number
}`,
    maxTokens: 3000,
  });

  if (fallback || !data?.script) {
    return {
      result: buildStubScript(input.lessonTitle, input.lessonContent),
      provider,
      fallback: true,
    };
  }

  return {
    result: {
      script: data.script,
      storyboard: data.storyboard ?? [],
      avatar_type: data.avatar_type ?? DEFAULT_AVATAR,
      voice_type: data.voice_type ?? DEFAULT_VOICE,
      duration_estimate_seconds: data.duration_estimate_seconds ?? 300,
    },
    provider,
    fallback: false,
  };
}
