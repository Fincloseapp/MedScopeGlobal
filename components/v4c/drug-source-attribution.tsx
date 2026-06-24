import { cn } from "@/lib/utils";
import { DRUG_AGENCIES } from "@/lib/v4c/sources";

export function DrugSourceAttribution({ className }: { className?: string }) {
  return (
    <aside
      className={cn(
        "rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600",
        className
      )}
    >
      <p className="font-semibold text-[#021d33]">Zdroje dat</p>
      <ul className="mt-3 space-y-2">
        {DRUG_AGENCIES.map((agency) => (
          <li key={agency.agency}>
            <a
              href={agency.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#005B96] hover:underline"
            >
              {agency.name}
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}
