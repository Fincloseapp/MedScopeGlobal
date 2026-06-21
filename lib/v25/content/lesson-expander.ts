/**
 * GROQ lesson expansion — expert medical education content (v25).
 * Target word count: targetMinutes * 150 (Czech WPM).
 */
import { groqCompleteJson, isGroqConfigured, resolveAiModel } from "@/lib/ai/groq-client";
import { CZECH_WPM, countWords, lessonListenText, readingMinutes } from "@/lib/academy/reading-time";
import type { SlideItem } from "@/lib/v25/video/slideshow-pipeline";

export type ExpandedLesson = {
  content: string;
  slides: SlideItem[];
  voiceoverText: string;
  readingMinutes: number;
  wordCount: number;
  expanded: boolean;
  provider: "groq" | "none";
};

export type LessonExpandInput = {
  lessonTitle: string;
  lessonBody: string;
  courseTitle: string;
  targetMinutes: number;
  existingSlides?: SlideItem[];
};

const EXPAND_SYSTEM = `Jsi tým medicínských expertů MedScope Academy (editor, klinik, pedagog). Vrať pouze JSON:
{
  "content": "rozšířený markdown text lekce (cs, spisovná čeština, odborná úroveň)",
  "slides": [
    {
      "title": "název slidu",
      "body": "3-5 vět k tématu",
      "imageDescription": "popis ilustrace",
      "imageKeywords": ["english", "medical", "terms"],
      "durationSeconds": 12
    }
  ],
  "voiceoverText": "souvislý mluvený komentář pro poslech"
}
Pravidla:
- Obsah MUSÍ odpovídat titulku lekce a kurzu
- Minimálně 6–10 slidů pro delší lekce
- imageKeywords = 2–5 anglických termínů pro ilustrační foto (anatomie, orgány, systémy)
- Žádné zkrácené odrážky — plné odstavce
- Zachovej faktickou správnost, přidej klinické souvislosti a příklady`;

export function needsExpansion(
  text: string,
  targetMinutes: number,
  thresholdRatio = 0.65
): boolean {
  const current = readingMinutes(text);
  return current < targetMinutes * thresholdRatio;
}

export async function expandLessonContent(input: LessonExpandInput): Promise<ExpandedLesson> {
  const targetWords = Math.max(300, input.targetMinutes * CZECH_WPM);
  const currentWords = countWords(input.lessonBody);
  const listenBaseline = lessonListenText({
    title: input.lessonTitle,
    content: input.lessonBody,
    slides: input.existingSlides,
  });
  const currentMinutes = readingMinutes(listenBaseline);

  if (!isGroqConfigured() || currentWords >= targetWords * 0.85) {
    const slides =
      input.existingSlides?.length ?
        input.existingSlides
      : splitToSlides(input.lessonTitle, input.lessonBody);
    return {
      content: input.lessonBody,
      slides,
      voiceoverText: listenBaseline,
      readingMinutes: currentMinutes,
      wordCount: currentWords,
      expanded: false,
      provider: "none",
    };
  }

  const raw = await groqCompleteJson({
    system: EXPAND_SYSTEM,
    user: `Kurz: ${input.courseTitle}
Lekce: ${input.lessonTitle}
Cílová délka poslechu: ${input.targetMinutes} min (~${targetWords} slov)
Aktuální délka: ~${currentMinutes} min (~${currentWords} slov)

Stávající obsah:
${input.lessonBody.slice(0, 4000)}

Rozšiř text na odbornou úroveň pro uchazeče o LF. Zachovej téma, přidej strukturu a hloubku.`,
    maxTokens: 8192,
    temperature: 0.4,
    model: resolveAiModel(),
  });

  if (!raw) {
    return {
      content: input.lessonBody,
      slides: input.existingSlides ?? splitToSlides(input.lessonTitle, input.lessonBody),
      voiceoverText: listenBaseline,
      readingMinutes: currentMinutes,
      wordCount: currentWords,
      expanded: false,
      provider: "none",
    };
  }

  try {
    const parsed = JSON.parse(raw) as {
      content?: string;
      slides?: SlideItem[];
      voiceoverText?: string;
    };
    const content = parsed.content?.trim() || input.lessonBody;
    const slides =
      parsed.slides?.length ?
        parsed.slides.map((s) => ({
          title: s.title || input.lessonTitle,
          body: s.body || "",
          imageDescription: s.imageDescription || s.title,
          imageKeywords: s.imageKeywords,
          durationSeconds: Math.max(8, Math.min(20, s.durationSeconds ?? 12)),
        }))
      : splitToSlides(input.lessonTitle, content);

    const voiceoverText =
      parsed.voiceoverText?.trim() ||
      [content, ...slides.map((s) => `${s.title}. ${s.body}`)].join("\n\n");

    const fullText = lessonListenText({ title: input.lessonTitle, content, slides });
    const words = countWords(fullText);
    const minutes = readingMinutes(fullText);

    return {
      content,
      slides,
      voiceoverText,
      readingMinutes: minutes,
      wordCount: words,
      expanded: true,
      provider: "groq",
    };
  } catch {
    return {
      content: input.lessonBody,
      slides: input.existingSlides ?? splitToSlides(input.lessonTitle, input.lessonBody),
      voiceoverText: listenBaseline,
      readingMinutes: currentMinutes,
      wordCount: currentWords,
      expanded: false,
      provider: "none",
    };
  }
}

function splitToSlides(title: string, body: string): SlideItem[] {
  const paragraphs = body
    .replace(/[#*]/g, "")
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 20)
    .slice(0, 8);

  if (!paragraphs.length) {
    return [{ title, body: body.slice(0, 280) || title, imageDescription: title, durationSeconds: 10 }];
  }

  return paragraphs.map((p, i) => ({
    title: i === 0 ? title : `${title} — část ${i + 1}`,
    body: p.slice(0, 400),
    imageDescription: title,
    durationSeconds: 12,
  }));
}
