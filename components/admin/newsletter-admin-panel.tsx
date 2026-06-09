"use client";

import { useCallback, useState } from "react";
import { Loader2, RefreshCw, Send, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { V23NewsletterIssueView } from "@/components/v23/newsletter-issue-view";
import type { NewsletterRow } from "@/lib/queries/v4c/newsletters";
import type { V23NewsletterLayout } from "@/lib/v23/newsletter/types";

type Topic = { id: string; topic_text: string; created_at: string };

export function NewsletterAdminPanel({
  initialDraft,
  initialTopics,
}: {
  initialDraft: NewsletterRow | null;
  initialTopics: Topic[];
}) {
  const [draft, setDraft] = useState(initialDraft);
  const [topics, setTopics] = useState(initialTopics);
  const [topicText, setTopicText] = useState("");
  const [loading, setLoading] = useState<"preview" | "publish" | "topic" | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const refreshPreview = useCallback(async () => {
    setLoading("preview");
    setMessage(null);
    try {
      const res = await fetch("/api/admin/newsletter/preview", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Chyba náhledu");
      if (json.draft) setDraft(json.draft);
      setMessage("Náhled příštího vydání byl aktualizován.");
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setLoading(null);
    }
  }, []);

  const publish = useCallback(async () => {
    setLoading("publish");
    setMessage(null);
    try {
      const res = await fetch("/api/admin/newsletter/generate", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Chyba publikace");
      setMessage(`Newsletter publikován: /newsletter/${json.slug}`);
      if (json.draft) setDraft(json.draft);
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setLoading(null);
    }
  }, []);

  const addTopic = useCallback(async () => {
    if (!topicText.trim()) return;
    setLoading("topic");
    setMessage(null);
    try {
      const res = await fetch("/api/admin/newsletter/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic_text: topicText.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Chyba");
      setTopics((t) => [...t, json.topic]);
      setTopicText("");
      setMessage("Téma přidáno — AI jej zapracuje do dalšího náhledu.");
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setLoading(null);
    }
  }, [topicText]);

  const layout = draft?.layout_json as V23NewsletterLayout | null;

  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="font-display text-lg font-bold text-[#021d33]">Příští newsletter</h2>
          <p className="text-sm text-slate-600">
            AI navrhne témata ze studií, článků, legislativy, digital health, léků a univerzit. Ruční témata
            zapracuje automaticky.
          </p>

          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={refreshPreview} disabled={loading !== null} className="rounded-full">
              {loading === "preview" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
              Obnovit náhled
            </Button>
            <Button type="button" variant="default" onClick={publish} disabled={loading !== null} className="rounded-full bg-[#021d33]">
              {loading === "publish" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              Vytvořit newsletter
            </Button>
          </div>

          {message ? <p className="text-sm text-slate-700">{message}</p> : null}

          {layout ? (
            <div className="rounded-xl bg-slate-50 p-4 text-sm">
              <p className="font-semibold">{layout.headline}</p>
              <p className="mt-1 text-slate-600">{layout.intro}</p>
              <ul className="mt-3 space-y-1 text-slate-600">
                {layout.sections.map((s) => (
                  <li key={s.id}>
                    {s.title} — {s.items.length} položek
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-sm text-amber-700">Zatím bez náhledu — klikněte na Obnovit náhled.</p>
          )}
        </div>

        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="font-display text-lg font-bold text-[#021d33]">Ruční témata</h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={topicText}
              onChange={(e) => setTopicText(e.target.value)}
              placeholder="Např. nová metodika DRG 2026"
              className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
            <Button type="button" onClick={addTopic} disabled={loading !== null || !topicText.trim()} className="rounded-full">
              {loading === "topic" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            </Button>
          </div>
          <ul className="space-y-2 text-sm">
            {topics.length === 0 ? (
              <li className="text-slate-500">Žádná čekající témata.</li>
            ) : (
              topics.map((t) => (
                <li key={t.id} className="rounded-lg border border-slate-100 px-3 py-2">
                  {t.topic_text}
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      {draft ? (
        <div>
          <h2 className="mb-4 font-display text-lg font-bold text-[#021d33]">Náhled layoutu</h2>
          <V23NewsletterIssueView issue={draft} />
        </div>
      ) : null}
    </div>
  );
}
