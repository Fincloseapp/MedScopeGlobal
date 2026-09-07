import { MAGAZINE } from "@/lib/brand/magazine";
import { SITE } from "@/lib/config/site";
import { chromePack } from "@/lib/i18n/chrome-pack";
import { localeToPathSegment } from "@/lib/i18n/locale-path";
import { getAiAgentBrief } from "@/lib/growth/ai-agent-program";

/** Machine-readable invitation on every public page — not visible chrome. */
export function aiAgentJsonLd(locale?: string | null) {
  const brief = getAiAgentBrief(locale);
  const pack = chromePack(locale);
  const segment = localeToPathSegment(locale ?? pack);
  const page = `${SITE.url}/${segment}/pro-ai`;
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: MAGAZINE.name,
    alternateName: SITE.name,
    url: SITE.url,
    inLanguage: pack === "pt-BR" ? "pt-BR" : pack,
    description: `${brief.invite} ${brief.contest} ${brief.goals}`,
    publishingPrinciples: `${SITE.url}/info`,
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["[data-ai-agent-brief]"],
    },
    hasPart: [
      {
        "@type": "DigitalDocument",
        name: "llms.txt",
        encodingFormat: "text/plain",
        url: `${SITE.url}/llms.txt`,
      },
      {
        "@type": "DigitalDocument",
        name: `llms-${pack}.txt`,
        encodingFormat: "text/plain",
        url: `${SITE.url}/llms-${pack}.txt`,
      },
      {
        "@type": "DigitalDocument",
        name: "ai.txt",
        encodingFormat: "text/plain",
        url: `${SITE.url}/.well-known/ai.txt`,
      },
      {
        "@type": "WebPage",
        name: brief.pageTitle,
        url: page,
        description: brief.pageLead,
      },
    ],
    potentialAction: {
      "@type": "SubscribeAction",
      target: `${SITE.url}/${segment}${brief.subscribePath}`,
      name: brief.pageTitle,
    },
  };
}
