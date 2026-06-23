import { DRUG_MONITOR_SOURCES } from "@/lib/v4c/drug-sources";

/** Minimální právní atribuce zdrojů — jedna diskrétní řádka. */
export function DrugSourceAttribution({ className = "" }: { className?: string }) {
  const portals = DRUG_MONITOR_SOURCES.filter(
    (s, i, arr) => arr.findIndex((x) => x.url === s.url) === i
  );

  return (
    <p className={`text-[10px] leading-relaxed text-slate-400 ${className}`}>
      Agregovaný přehled MedScopeGlobal · oficiální zdroje:{" "}
      {portals.map((s, i) => (
        <span key={s.id}>
          {i > 0 ? " · " : null}
          <a
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-slate-300 underline-offset-2 hover:text-slate-500"
          >
            {s.name}
          </a>
        </span>
      ))}
      . U každé položky odkaz na primární dokument.
    </p>
  );
}
