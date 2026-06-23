"use client";

import { useState } from "react";
import { Bot, Send, User } from "lucide-react";
import { Button } from "@/components/ui/button";

type Message = { role: "user" | "assistant"; content: string };

type Props = {
  lessonTitle: string;
  lessonContent?: string;
  courseTitle?: string;
  compact?: boolean;
};

const SYSTEM_GREETING =
  "Ahoj! Jsem váš AI lektor MedScope Academy. Zeptejte se mě na cokoli k této lekci — vysvětlím pojmy, doplním klinický kontext nebo pomohu s přípravou na zkoušku.";

export function AiLecturerPanel({ lessonTitle, lessonContent, courseTitle, compact }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: SYSTEM_GREETING },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/academy/mentoring/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          lessonTitle,
          lessonContent: lessonContent?.slice(0, 3000),
          courseTitle,
          history: messages.slice(-6),
        }),
      });
      const data = (await res.json()) as { reply?: string; error?: string };
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.reply ?? data.error ?? "Omlouvám se, odpověď se nepodařila načíst.",
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Síťová chyba — zkuste to prosím znovu." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className={`flex flex-col rounded-2xl border border-[#cfe1f3] bg-white shadow-[0_12px_30px_-24px_rgba(0,91,150,0.55)] ${
        compact ? "h-[420px]" : "h-[520px]"
      }`}
    >
      <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e8f4fc]">
          <Bot className="h-5 w-5 text-[#005B96]" />
        </div>
        <div>
          <p className="text-sm font-semibold text-[#021d33]">AI lektor</p>
          <p className="text-xs text-slate-500">Evropský medicínský tutor · {lessonTitle}</p>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
          >
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                msg.role === "user" ? "bg-slate-100" : "bg-[#e8f4fc]"
              }`}
            >
              {msg.role === "user" ? (
                <User className="h-3.5 w-3.5 text-slate-600" />
              ) : (
                <Bot className="h-3.5 w-3.5 text-[#005B96]" />
              )}
            </div>
            <p
              className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                msg.role === "user"
                  ? "bg-[#005B96] text-white"
                  : "bg-slate-50 text-slate-700"
              }`}
            >
              {msg.content}
            </p>
          </div>
        ))}
        {loading ? (
          <p className="text-center text-xs text-slate-400">AI lektor přemýšlí…</p>
        ) : null}
      </div>

      <form onSubmit={sendMessage} className="border-t border-slate-100 p-3">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Zeptejte se na lekci…"
            className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#005B96]"
            disabled={loading}
          />
          <Button type="submit" size="sm" disabled={loading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
