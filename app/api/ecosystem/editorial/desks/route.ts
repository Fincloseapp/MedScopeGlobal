import { NextResponse } from "next/server";
import {
  EDITORIAL_DESKS,
  getDeskForLocale,
  DEFAULT_TOPIC_WEIGHTS,
} from "@/lib/ecosystem/editorial/desks";
import {
  EDITORIAL_PERSONAS,
  getPersonasForLocale,
} from "@/lib/ecosystem/editorial/personas";
import { SYNDICATION_RULES } from "@/lib/ecosystem/editorial/syndication";
import type { GlobalLocaleCode } from "@/lib/ecosystem/locales";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const locale = (searchParams.get("locale") ?? "cs") as GlobalLocaleCode;

  const desk = getDeskForLocale(locale);
  const personas = getPersonasForLocale(locale);

  return NextResponse.json({
    desk,
    personas: personas.map((p) => ({
      id: p.id,
      displayName: p.displayName,
      role: p.role,
      topics: p.topics,
    })),
    topicWeights: DEFAULT_TOPIC_WEIGHTS,
    syndicationRules: SYNDICATION_RULES.filter(
      (r) => r.sourceLocale === locale || r.targetLocales.includes(locale)
    ),
    allDesks: EDITORIAL_DESKS.map((d) => ({
      id: d.id,
      locale: d.locale,
      region: d.region,
      label: d.label,
      syndicationHub: d.syndicationHub,
    })),
  });
}
