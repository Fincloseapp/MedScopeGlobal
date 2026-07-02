import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { getUniversityNewsList } from "@/lib/queries/v4c/university-news";

export default async function Page() {
  const news = await getUniversityNewsList("kalendar");
  return (
    <ModulePageShell eyebrow="Novinky" title="Kalendář" description="Události a termíny z univerzit.">
      <ul className="space-y-3 border-l-2 border-[#cfe1f3] pl-6">
        {news.map((n) => (
          <li key={n.id} className="relative">
            <span className="absolute -left-[29px] top-1.5 h-3 w-3 rounded-full bg-[#005B96]" />
            <p className="font-semibold text-[#021d33]">{n.title}</p>
            <p className="text-xs text-slate-500">{n.event_date ?? n.published_date}</p>
          </li>
        ))}
      </ul>
    </ModulePageShell>
  );
}
