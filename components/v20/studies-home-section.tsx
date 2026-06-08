import Link from "next/link";
import { V20StudyCard } from "@/components/v20/study-card";
import { getV20LatestStudies } from "@/lib/v20/studies/query";
import { getCached, setCached, cacheKey } from "@/lib/v20/server-cache";

async function getCachedLatestStudies(limit: number) {
  const ck = cacheKey({ route: "v22-home-studies", limit });
  const hit = getCached<Awaited<ReturnType<typeof getV20LatestStudies>>>(ck, 120_000);
  if (hit) return hit;
  const studies = await getV20LatestStudies(limit);
  setCached(ck, studies);
  return studies;
}

export async function V20StudiesHomeSection() {
  const studies = await getCachedLatestStudies(4);
  if (!studies.length) return null;

  return (
    <section className="border-y border-slate-200 bg-white" aria-labelledby="home-studie-heading">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-primary">Výzkum</p>
            <h2 id="home-studie-heading" className="mt-2 font-display text-3xl font-semibold text-[#021d33]">
              Studie
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Čtyři nejnovější klinické studie v češtině — souhrn, metodika, výsledky a klinický dopad z
              ověřených zdrojů.
            </p>
          </div>
          <Link href="/studie" prefetch className="text-sm font-medium text-primary hover:underline">
            Všechny studie →
          </Link>
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {studies.map((study) => (
            <V20StudyCard key={study.id} study={study} />
          ))}
        </div>
      </div>
    </section>
  );
}
