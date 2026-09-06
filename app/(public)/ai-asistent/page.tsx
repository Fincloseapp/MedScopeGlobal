import type { Metadata } from "next";
import Link from "next/link";
import { getAiAssistantCopy } from "@/lib/i18n/ai-assistant-copy";
import { localizePublicHref } from "@/lib/i18n/nav-copy";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { buildLocalizedV20PageMetadata } from "@/lib/v20/seo";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const copy = getAiAssistantCopy(locale);
  return await buildLocalizedV20PageMetadata({
    title: copy.hubMetaTitle,
    description: copy.hubMetaDescription,
    path: "/ai-asistent",
    locale,
  });
}

export default async function AiAsistentHubPage() {
  const locale = await getServerLocale();
  const copy = getAiAssistantCopy(locale);

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <h1 className="font-display text-4xl font-bold text-[#021d33]">{copy.hubTitle}</h1>
      <p className="mt-3 text-muted-foreground">{copy.hubLead}</p>
      <div className="mt-10 grid gap-4">
        {copy.cards.map((a) => (
          <Link
            key={a.href}
            href={localizePublicHref(a.href, locale)}
            className={`block rounded-2xl bg-gradient-to-r ${a.color} p-6 text-white transition hover:opacity-95`}
          >
            <p className="font-display text-xl font-semibold">{a.label}</p>
            <p className="mt-1 text-sm text-white/85">{a.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
