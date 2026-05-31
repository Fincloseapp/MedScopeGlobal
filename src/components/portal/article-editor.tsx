"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { medicalSpecializations } from "@/lib/portal/specializations";
import type { PortalArticle } from "@/lib/portal/types";

interface ArticleEditorProps {
  article?: PortalArticle;
}

export function ArticleEditor({ article }: ArticleEditorProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"manual" | "generate">("generate");

  async function handleGenerate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const keywords = String(form.get("keywords") ?? "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const response = await fetch("/api/portal/articles/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topic: form.get("topic"),
        specialization: form.get("specialization"),
        keywords
      })
    });
    const data = await response.json().catch(() => ({}));
    setLoading(false);
    if (!response.ok) {
      setError(data.error ?? "Generování selhalo");
      return;
    }
    router.push(`/portal/manage/${data.article.id}/edit`);
  }

  async function handleManual(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const payload = {
      title: form.get("title"),
      summary: form.get("summary"),
      specialization: form.get("specialization"),
      clinicalSignificance: form.get("clinicalSignificance"),
      practiceRecommendations: form.get("practiceRecommendations"),
      sections: [
        {
          id: "intro",
          heading: "Úvod",
          content: String(form.get("intro")),
          highlights: [String(form.get("topicHighlight") ?? "")]
        }
      ],
      citations: [
        {
          id: "cit-1",
          title: String(form.get("citationTitle")),
          sourceName: String(form.get("citationSource")),
          sourceUrl: String(form.get("citationUrl") ?? ""),
          doi: String(form.get("citationDoi") ?? "")
        }
      ],
      tags: String(form.get("tags") ?? "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      icdCodes: String(form.get("icdCodes") ?? "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    };

    const response = await fetch(article ? `/api/portal/articles/${article.id}` : "/api/portal/articles", {
      method: article ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json().catch(() => ({}));
    setLoading(false);
    if (!response.ok) {
      setError(data.error ?? "Uložení selhalo");
      return;
    }
    router.push("/portal/manage");
  }

  async function publishArticle() {
    if (!article) return;
    setLoading(true);
    const response = await fetch(`/api/portal/articles/${article.id}/publish`, { method: "POST" });
    setLoading(false);
    if (response.ok) router.push(`/portal/articles/${article.slug}`);
    else {
      const data = await response.json().catch(() => ({}));
      setError(data.error ?? "Publikace selhala");
    }
  }

  return (
    <div className="card article-editor">
      <div className="mode-switch actions">
        <button className={mode === "generate" ? "button primary" : "button"} type="button" onClick={() => setMode("generate")}>
          AI generování
        </button>
        <button className={mode === "manual" ? "button primary" : "button"} type="button" onClick={() => setMode("manual")}>
          Manuální vytvoření
        </button>
      </div>

      {mode === "generate" && !article ? (
        <form className="form" onSubmit={handleGenerate}>
          <label>
            Téma článku
            <input name="topic" required placeholder="Kardiovaskulární prevence v primární péči" />
          </label>
          <label>
            Klíčová slova (oddělená čárkou)
            <input name="keywords" placeholder="prevence, TK, ESC" />
          </label>
          <label>
            Medicínský obor
            <select name="specialization" required defaultValue="Kardiologie">
              {medicalSpecializations.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <button className="button primary" type="submit" disabled={loading}>
            {loading ? "Generuji…" : "Generovat článek"}
          </button>
        </form>
      ) : (
        <form className="form" onSubmit={handleManual}>
          <label>
            Nadpis
            <input name="title" required defaultValue={article?.title} />
          </label>
          <label>
            Shrnutí
            <textarea name="summary" required rows={3} defaultValue={article?.summary} />
          </label>
          <label>
            Obor
            <select name="specialization" defaultValue={article?.specialization ?? "Kardiologie"}>
              {medicalSpecializations.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label>
            Úvod
            <textarea name="intro" required rows={4} defaultValue={article?.sections[0]?.content} />
          </label>
          <label>
            Klinický význam
            <textarea name="clinicalSignificance" required rows={3} defaultValue={article?.clinicalSignificance} />
          </label>
          <label>
            Doporučení pro praxi
            <textarea name="practiceRecommendations" required rows={3} defaultValue={article?.practiceRecommendations} />
          </label>
          <label>
            Citace – název
            <input name="citationTitle" required defaultValue={article?.citations[0]?.title} />
          </label>
          <label>
            Citace – zdroj
            <input name="citationSource" required defaultValue={article?.citations[0]?.sourceName} />
          </label>
          <label>
            URL zdroje
            <input name="citationUrl" defaultValue={article?.citations[0]?.sourceUrl} />
          </label>
          <label>
            DOI
            <input name="citationDoi" defaultValue={article?.citations[0]?.doi} />
          </label>
          <label>
            Tagy
            <input name="tags" defaultValue={article?.tags.join(", ")} />
          </label>
          <label>
            ICD kódy
            <input name="icdCodes" defaultValue={article?.icdCodes.join(", ")} />
          </label>
          <div className="actions">
            <button className="button primary" type="submit" disabled={loading}>
              {loading ? "Ukládám…" : "Uložit koncept"}
            </button>
            {article && article.status === "draft" ? (
              <button className="button" type="button" disabled={loading} onClick={publishArticle}>
                Publikovat
              </button>
            ) : null}
          </div>
        </form>
      )}

      {error ? <p className="error">{error}</p> : null}
    </div>
  );
}
