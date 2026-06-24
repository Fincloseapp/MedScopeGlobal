"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function ModuleAiAssistant({
  module,
  placeholder,
}: {
  module: string;
  placeholder?: string;
}) {
  const [query, setQuery] = useState("");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);

  async function run() {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/ai/module", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ module, query }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Chyba");
      setReply(json.reply ?? "");
    } catch (e) {
      setReply(e instanceof Error ? e.message : "Chyba");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4 rounded-2xl border border-[#cfe1f3] bg-white p-6">
      <textarea
        className="min-h-[100px] w-full rounded-md border border-input px-3 py-2 text-sm"
        placeholder={placeholder ?? "Zadejte dotaz nebo příkaz…"}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <Button onClick={run} disabled={loading} className="rounded-full bg-[#005B96]">
        {loading ? "AI…" : "Spustit asistenta"}
      </Button>
      {reply ? (
        <pre className="whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-sm text-slate-800">{reply}</pre>
      ) : null}
    </div>
  );
}
