import Link from "next/link";
import { WriterAgentMark } from "@/components/editorial/writer-agent-mark";
import { getSurfaceCopy, writerAgentsForLocale, writerDesksForLocale } from "@/lib/i18n/surface-copy";
import { localizePublicHref } from "@/lib/i18n/nav-copy";

export function WriterAgentsStrip({ locale = "cs" }: { locale?: string }) {
  const surface = getSurfaceCopy(locale);
  const desks = writerDesksForLocale(locale);
  const specialists = writerAgentsForLocale(locale);
  return (
    <section className="mt-3 rounded-lg border border-slate-200 bg-white px-3 py-3 shadow-sm sm:px-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h2 className="text-sm font-bold text-[#021d33]">{surface.writersTitle}</h2>
        <Link href={localizePublicHref("/verejnost/clanky", locale)} className="text-xs font-medium text-[#005B96] hover:underline">
          {surface.writersAll}
        </Link>
      </div>
      <ul className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-5">
        {desks.map((desk) => {
          const bench = specialists.filter((agent) => agent.deskId === desk.id);
          return (
            <li key={desk.id}>
              <Link
                href={localizePublicHref(desk.href, locale)}
                className="flex items-center gap-2 rounded-md px-1.5 py-1.5 hover:bg-slate-50"
              >
                <WriterAgentMark agent={desk} size={36} />
                <span className="min-w-0">
                  <span className="block truncate text-xs font-semibold text-[#021d33]">{desk.label}</span>
                  <span className="block truncate text-[10px] text-slate-500">{desk.hint}</span>
                </span>
              </Link>
              <ul className="mt-1 space-y-0.5 pl-1">
                {bench.map((agent) => (
                  <li key={agent.id} className="truncate text-[10px] text-slate-500">
                    {agent.hint}
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
