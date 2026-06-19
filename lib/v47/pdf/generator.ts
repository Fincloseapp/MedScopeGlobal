import { generateSlides } from "@/lib/v47/slides/generator";

export async function generatePdfSummary(input: { topic: string; content?: string }) {
  const slides = await generateSlides({ topic: input.topic, slideCount: 4 });
  if (!slides.ok) {
    return {
      ok: false as const,
      error: slides.error ?? "PDF scaffold failed",
      scaffold: true,
      pdfUrl: null as string | null,
    };
  }

  return {
    ok: true as const,
    pdfUrl: null as string | null,
    format: "markdown" as const,
    summary: slides.slides,
    message: "PDF rendering scaffold — export via client print or future PDF service",
    provider: "groq" as const,
  };
}
