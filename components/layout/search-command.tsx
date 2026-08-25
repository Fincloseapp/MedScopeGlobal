"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { tryCreateClient } from "@/lib/supabase/client";
import Link from "next/link";
import { mergedArticleSearch } from "@/utils/merged-article-search";
import { sanitizeSearchInput } from "@/utils/search";

import type { AccessLevelId } from "@/lib/config/access-levels";
import { APP_PRODUCTS } from "@/lib/apps/catalog";

export function SearchCommand({
  isVip = false,
  accessLevel = "public",
}: {
  isVip?: boolean;
  accessLevel?: AccessLevelId;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<
    { slug: string; title: string; excerpt: string | null }[]
  >([]);
  const [loading, setLoading] = useState(false);

  const runSearch = useCallback(async (term: string) => {
    const t = sanitizeSearchInput(term);
    if (t.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    const supabase = tryCreateClient();
    if (!supabase) {
      setLoading(false);
      setResults([]);
      return;
    }
    const rows = await mergedArticleSearch(supabase, term, 12, isVip, accessLevel);
    setLoading(false);
    setResults(rows);
  }, [isVip, accessLevel]);

  useEffect(() => {
    const id = setTimeout(() => {
      void runSearch(q);
    }, 200);
    return () => clearTimeout(id);
  }, [q, runSearch]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="hidden gap-2 md:flex">
          <Search className="h-4 w-4" />
          Hledat
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Hledat na MedScopeGlobal</DialogTitle>
        </DialogHeader>
        <Input
          autoFocus
          placeholder="Aplikace, články, témata…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <div className="max-h-72 space-y-2 overflow-auto">
          {q.trim().length < 2 ? (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#005B96]">Aplikace</p>
              {APP_PRODUCTS.map((app) => (
                <Link
                  key={app.id}
                  href={app.appPath}
                  className="block rounded-md border p-3 text-left transition hover:bg-muted"
                  onClick={() => setOpen(false)}
                >
                  <p className="font-medium">{app.shortName}</p>
                  <p className="text-sm text-muted-foreground">{app.tagline}</p>
                </Link>
              ))}
            </div>
          ) : null}
          {loading && <p className="text-sm text-muted-foreground">Hledám…</p>}
          {!loading &&
            results.map((r) => (
              <Link
                key={r.slug}
                href={`/article/${r.slug}`}
                className="block rounded-md border p-3 text-left transition hover:bg-muted"
                onClick={() => setOpen(false)}
              >
                <p className="font-medium">{r.title}</p>
                {r.excerpt && (
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {r.excerpt}
                  </p>
                )}
              </Link>
            ))}
          {!loading && q.trim().length >= 2 && results.length === 0 && (
            <p className="text-sm text-muted-foreground">Nic se nenašlo. Zkuste MeDipacient, MeDiprep nebo OrdiZapis.</p>
          )}
        </div>
        <Button
          variant="secondary"
          className="w-full"
          onClick={() => {
            router.push(`/search?q=${encodeURIComponent(q)}`);
            setOpen(false);
          }}
        >
          Otevřít plné hledání
        </Button>
      </DialogContent>
    </Dialog>
  );
}
