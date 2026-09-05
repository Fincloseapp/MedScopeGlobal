"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BookOpen, Search } from "lucide-react";
import type { PublicStudentMaterialListItem } from "@/lib/studenti/materials";
import {
  PUBLIC_LEGAL_NOTICE,
  PUBLIC_SOURCE_LABEL,
} from "@/lib/studenti/materials-anonymize";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const PAGE_SIZE = 24;

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

export function StudentMaterialsBrowser({
  materials,
  subjects,
  stats,
}: {
  materials: PublicStudentMaterialListItem[];
  subjects: string[];
  stats: { total: number; byRocnik: Record<string, number> };
}) {
  const [rocnik, setRocnik] = useState<string>("all");
  const [subject, setSubject] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [visible, setVisible] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return materials.filter((m) => {
      if (rocnik === "0") {
        if (m.category !== "recent" && m.rocnik !== 0) return false;
      } else if (rocnik !== "all" && String(m.rocnik ?? "") !== rocnik) {
        return false;
      }
      if (subject !== "all" && m.subject !== subject) return false;
      if (
        q &&
        !m.display_title.toLowerCase().includes(q) &&
        !m.subject.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [materials, rocnik, subject, query]);

  useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [rocnik, subject, query]);

  const shown = filtered.slice(0, visible);
  const hasMore = visible < filtered.length;

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-[#1b1712]/12 bg-white/80 p-5">
        <p className="text-sm leading-7 text-[#5c564c]">
          Kurátorovaná knihovna studijních materiálů pro studenty medicíny — vyhledávání
          podle ročníku, oboru a názvu. Materiály lze{" "}
          <span className="font-medium text-[#8a6d32]">číst online</span> přímo v prohlížeči.
        </p>
        <p className="mt-2 text-xs text-slate-500">
          {PUBLIC_SOURCE_LABEL} · celkem {stats.total} materiálů · filtr: {filtered.length}
          {filtered.length > shown.length ? ` · zobrazeno ${shown.length}` : ""}
        </p>
      </div>

      <Tabs value={rocnik} onValueChange={setRocnik}>
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 bg-[#e8e2d6] p-1">
          {ROCNIK_TABS.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="rounded-full px-3 py-1.5 text-xs data-[state=active]:bg-[#1b1712] data-[state=active]:text-[#f6f1e8]"
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
        <p className="rounded-xl border border-dashed border-[#1b1712]/20 bg-white/70 p-8 text-center text-sm text-[#5c564c]">
          Žádné materiály pro zvolené filtry.
        </p>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((m) => (
              <Link
                key={m.id}
                href={m.read_path}
                className="group flex flex-col rounded-2xl border border-[#1b1712]/12 bg-white/80 p-5 transition hover:border-[#8a6d32]/50"
              >
                <h3 className="font-display text-base font-semibold leading-snug text-[#1b1712] group-hover:text-[#8a6d32]">
                  {m.display_title}
                </h3>
                <p className="mt-2 text-xs font-medium text-[#8a6d32]">{m.subject}</p>
                {m.rocnik !== null && m.rocnik > 0 ? (
                  <p className="mt-1 text-xs text-slate-500">{m.rocnik}. ročník</p>
                ) : m.category === "recent" ? (
                  <p className="mt-1 text-xs text-slate-500">Naposled přidané</p>
                ) : null}
                <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-[#8a6d32]">
                  <BookOpen className="h-3.5 w-3.5" />
                  Číst
                </span>
              </Link>
            ))}
          </div>
          {hasMore ? (
            <div className="flex justify-center">
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                onClick={() => setVisible((n) => n + PAGE_SIZE)}
              >
                Načíst další ({filtered.length - shown.length} zbývá)
              </Button>
            </div>
          ) : null}
        </>
      )}

      <footer className="rounded-2xl border border-[#1b1712]/12 bg-[#f6f1e8] p-5 text-sm leading-7 text-[#1b1712]/80">
        <p className="font-semibold text-[#1b1712]">Podmínky použití</p>
        <p className="mt-2">{PUBLIC_LEGAL_NOTICE}</p>
        <p className="mt-3 text-xs text-[#8a8377]">
          Máte dotaz nebo nenašli jste materiál?{" "}
          <Link href="/kontakt" className="text-[#8a6d32] underline-offset-2 hover:underline">
            Kontaktujte nás
          </Link>
          .
        </p>
      </footer>
    </div>
  );
}
