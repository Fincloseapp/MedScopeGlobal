"use client";

import { useMemo, useState } from "react";
import { ExternalLink, FileText, Search } from "lucide-react";
import type { StudentMaterial } from "@/lib/studenti/materials";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ROCNIK_TABS = [
  { value: "all", label: "Vše" },
  { value: "0", label: "Nedávno" },
  { value: "1", label: "1. ročník" },
  { value: "2", label: "2. ročník" },
  { value: "3", label: "3. ročník" },
  { value: "4", label: "4. ročník" },
  { value: "5", label: "5. ročník" },
  { value: "6", label: "6. ročník" },
] as const;

function fileTypeLabel(type: string | null) {
  if (!type || type === "unknown") return "Soubor";
  return type.toUpperCase();
}

export function StudentMaterialsBrowser({
  materials,
  subjects,
  stats,
}: {
  materials: StudentMaterial[];
  subjects: string[];
  stats: { total: number; byRocnik: Record<string, number> };
}) {
  const [rocnik, setRocnik] = useState<string>("all");
  const [subject, setSubject] = useState<string>("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return materials.filter((m) => {
      if (rocnik !== "all" && String(m.rocnik ?? "") !== rocnik) return false;
      if (subject !== "all" && m.subject !== subject) return false;
      if (q && !m.title.toLowerCase().includes(q) && !m.subject.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [materials, rocnik, subject, query]);

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-[#cfe1f3] bg-white p-5 shadow-[0_12px_30px_-24px_rgba(0,91,150,0.55)]">
        <p className="text-sm leading-7 text-slate-600">
          Kurátorovaný přehled studijních materiálů z portálu{" "}
          <a
            href="https://lf1.cz/materialy-ke-stazeni/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-[#005B96] underline-offset-2 hover:underline"
          >
            LF1.CZ
          </a>{" "}
          (neoficiální studentské stránky 1. LF UK). MedScopeGlobal materiály nehostuje — vždy
          odkazujeme na originál u zdroje.
        </p>
        <p className="mt-2 text-xs text-slate-500">
          Celkem {stats.total} materiálů v indexu · zobrazeno {filtered.length}
        </p>
      </div>

      <Tabs value={rocnik} onValueChange={setRocnik}>
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 bg-[#eef4fb] p-1">
          {ROCNIK_TABS.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="rounded-full px-3 py-1.5 text-xs data-[state=active]:bg-[#005B96] data-[state=active]:text-white"
            >
              {tab.label}
              {tab.value !== "all" && stats.byRocnik[tab.value] ? (
                <span className="ml-1 opacity-70">({stats.byRocnik[tab.value]})</span>
              ) : null}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="grid gap-4 md:grid-cols-[1fr_220px]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Hledat podle názvu nebo oboru…"
            className="pl-9"
          />
        </div>
        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          aria-label="Filtrovat podle oboru"
        >
          <option value="all">Všechny obory</option>
          {subjects.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed border-[#cfe1f3] bg-white p-8 text-center text-sm text-slate-500">
          Žádné materiály pro zvolené filtry.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((m) => (
            <a
              key={m.id}
              href={m.external_url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col rounded-2xl border border-[#cfe1f3] bg-white p-4 shadow-[0_12px_30px_-24px_rgba(0,91,150,0.55)] transition hover:-translate-y-0.5 hover:border-[#005B96]/40"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#eef4fb] text-[#005B96]">
                  <FileText className="h-4 w-4" />
                </div>
                <Badge variant="secondary" className="shrink-0 text-[10px] uppercase">
                  {fileTypeLabel(m.file_type)}
                </Badge>
              </div>
              <h3 className="mt-3 font-display text-base font-semibold leading-snug text-[#021d33] group-hover:text-[#005B96]">
                {m.title}
              </h3>
              <p className="mt-1 text-xs font-medium text-[#005B96]/80">{m.subject}</p>
              {m.rocnik !== null && m.rocnik > 0 ? (
                <p className="mt-1 text-xs text-slate-500">{m.rocnik}. ročník</p>
              ) : m.category === "recent" ? (
                <p className="mt-1 text-xs text-slate-500">Naposled přidané</p>
              ) : null}
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-[#005B96]">
                Otevřít na LF1.CZ
                <ExternalLink className="h-3 w-3" />
              </span>
            </a>
          ))}
        </div>
      )}

      <footer className="rounded-2xl border border-amber-200/80 bg-amber-50/70 p-5 text-sm leading-7 text-slate-700">
        <p className="font-semibold text-[#021d33]">Právní upozornění a podmínky použití</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            Materiály jsou hostovány výhradně na{" "}
            <a
              href="https://lf1.cz/materialy-ke-stazeni/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#005B96] underline-offset-2 hover:underline"
            >
              lf1.cz
            </a>
            . Autorská práva náleží původním autorům a nahrávajícím studentům.
          </li>
          <li>
            MedScopeGlobal vystupuje pouze jako kurátor a vyhledávač — nejsme vydavatelem ani
            držitelem licencí k těmto souborům.
          </li>
          <li>
            Obsah je určen výhradně pro osobní studijní účely studentů medicíny. Před sdílením
            nebo komerčním využitím ověřte podmínky u zdroje.
          </li>
          <li>
            Nenašli jste materiál nebo je odkaz nefunkční? Kontaktujte správce LF1.CZ nebo nás na{" "}
            <a href="/kontakt" className="text-[#005B96] underline-offset-2 hover:underline">
              kontaktní stránce
            </a>
            .
          </li>
        </ul>
        <p className="mt-3 text-xs text-slate-500">
          Zdroj: LF UK Praha — LF1.CZ · Index kurátorován MedScopeGlobal
        </p>
      </footer>
    </div>
  );
}
