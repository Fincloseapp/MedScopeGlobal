import { NextResponse } from "next/server";
import { getV20LatestStudies } from "@/lib/v20/studies/query";
import { getV22DigitalHealthList } from "@/lib/v22/digital-health/query";
import { interestsFromPaths, type V23Recommendation } from "@/lib/v23/recommendations";
import { getDrugNewsList } from "@/lib/queries/v4c/drug-news";
import { getLegislationList } from "@/lib/queries/v4c/legislation";
import { V22_STUDY_GAMES } from "@/lib/v22/games";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { paths?: string[] };
  const paths = Array.isArray(body.paths) ? body.paths.slice(0, 30) : [];
  const interests = interestsFromPaths(paths);
  const items: V23Recommendation[] = [];

  if (interests.includes("studie")) {
    const studies = await getV20LatestStudies(2);
    for (const s of studies) {
      items.push({
        title: s.titleCs,
        summary: s.summaryCs.slice(0, 160),
        href: `/studie/${s.slug}`,
        topic: "Studie",
        reason: "Na základě vašeho zájmu o klinický výzkum",
      });
    }
  }

  if (interests.includes("leky")) {
    const drugs = await getDrugNewsList();
    for (const d of drugs.slice(0, 2)) {
      items.push({
        title: d.title,
        summary: (d.summary ?? "").slice(0, 160),
        href: `/leky/novinky/${d.slug}`,
        topic: "Léky",
        reason: "Doporučeno podle lékových sekcí",
      });
    }
  }

  if (interests.includes("legislativa")) {
    const leg = await getLegislationList(undefined, 2);
    for (const l of leg) {
      items.push({
        title: l.title,
        summary: (l.summary ?? "").slice(0, 160),
        href: `/legislativa/${l.slug}`,
        topic: "Legislativa",
        reason: "Relevantní regulace pro vaši aktivitu",
      });
    }
  }

  if (interests.includes("digital-health")) {
    const dh = await getV22DigitalHealthList(2);
    for (const a of dh) {
      items.push({
        title: a.title,
        summary: a.summaryCs.slice(0, 160),
        href: `/digital-health/${a.slug}`,
        topic: "Digitální zdravotnictví",
        reason: "eHealth a AI podle vaší historie",
      });
    }
  }

  if (interests.includes("medicina")) {
    for (const g of V22_STUDY_GAMES.slice(0, 2)) {
      items.push({
        title: g.title,
        summary: g.description,
        href: `/medicina/hry/${g.slug}`,
        topic: "Studium medicíny",
        reason: "Procvičení pro studenty LF",
      });
    }
  }

  if (items.length < 4) {
    const fallback = await getV20LatestStudies(4 - items.length);
    for (const s of fallback) {
      if (items.some((i) => i.href === `/studie/${s.slug}`)) continue;
      items.push({
        title: s.titleCs,
        summary: s.summaryCs.slice(0, 160),
        href: `/studie/${s.slug}`,
        topic: "Studie",
        reason: "Oblíbené u odborníků MedScope",
      });
    }
  }

  return NextResponse.json({ items: items.slice(0, 6), interests });
}
