"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  LayoutDashboard,
  GraduationCap,
  CalendarRange,
  UserRound,
  Wifi,
  WifiOff,
} from "lucide-react";
import { InstallPwaButton } from "@/components/apps/install-pwa-button";
import { MEDIPREP, appLockline } from "@/lib/apps/catalog";
import { buildPrepTest, getPrepDashboard, type PrepDashboard } from "@/lib/mediprep/dashboard";
import { GUEST_PREP_SESSION } from "@/lib/mediprep/guest";
import type { PrepSession } from "@/lib/mediprep/types";
import type { GeneratedSelfTest } from "@/lib/prijimacky/quiz-from-bank";

type TabId = "prehled" | "testy" | "plan" | "ucet";

const TABS: { id: TabId; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "prehled", label: "Přehled", icon: LayoutDashboard },
  { id: "testy", label: "Testy", icon: GraduationCap },
  { id: "plan", label: "Plán", icon: CalendarRange },
  { id: "ucet", label: "Účet", icon: UserRound },
];

function initialTab(): TabId {
  if (typeof window === "undefined") return "prehled";
  const t = new URLSearchParams(window.location.search).get("tab");
  if (t === "prehled" || t === "testy" || t === "plan" || t === "ucet") return t;
  return "prehled";
}

export function PrepAppShell() {
  const [tab, setTab] = useState<TabId>(initialTab);
  const [online, setOnline] = useState(true);
  const [session, setSession] = useState<PrepSession>(GUEST_PREP_SESSION);
  const [dash, setDash] = useState<PrepDashboard>(() => getPrepDashboard());
  const [test, setTest] = useState<GeneratedSelfTest | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [otpHint, setOtpHint] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setOnline(navigator.onLine);
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  const load = useCallback(async () => {
    try {
      const [sRes, dRes] = await Promise.all([
        fetch("/api/mediprep/session", { credentials: "same-origin" }),
        fetch("/api/mediprep/dashboard", { credentials: "same-origin" }),
      ]);
      if (sRes.ok) setSession((await sRes.json()) as PrepSession);
      else setSession(GUEST_PREP_SESSION);
      if (dRes.ok) {
        const json = (await dRes.json()) as PrepDashboard;
        if (json?.bank?.total && json?.faculties?.length) setDash(json);
        else setDash(getPrepDashboard());
      } else {
        setDash(getPrepDashboard());
      }
    } catch {
      setSession(GUEST_PREP_SESSION);
      setDash(getPrepDashboard());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("tab", tab);
    window.history.replaceState({}, "", url.toString());
  }, [tab]);

  async function startTest(faculty?: string) {
    const fallback = () =>
      buildPrepTest({
        mode: "simulace",
        count: 12,
        faculty: faculty || "mix",
        seed: `client-${faculty || "mix"}`,
      });
    try {
      const res = await fetch(
        `/api/mediprep/test?mode=simulace&count=12&faculty=${encodeURIComponent(faculty || "mix")}`,
        { credentials: "same-origin" }
      );
      if (!res.ok) {
        setTest(fallback());
        setAnswers({});
        setSubmitted(false);
        setTab("testy");
        return;
      }
      const json = (await res.json()) as { test: GeneratedSelfTest };
      setTest(json.test ?? fallback());
    } catch {
      setTest(fallback());
    }
    setAnswers({});
    setSubmitted(false);
    setTab("testy");
  }

  async function requestCode() {
    try {
      const res = await fetch("/api/mediprep/otp/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = (await res.json()) as { message?: string; devCode?: string; error?: string };
      setOtpHint(json.devCode ? `${json.message} (kód ${json.devCode})` : json.message || json.error || "Kód odeslán.");
    } catch {
      setOtpHint("Kód se nepodařilo odeslat. Zkuste to znovu online.");
    }
  }

  async function verifyCode() {
    try {
      const res = await fetch("/api/mediprep/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const json = (await res.json()) as { ok?: boolean; message?: string; error?: string };
      setOtpHint(json.message || json.error || (json.ok ? "Přihlášeni." : "Ověření selhalo."));
      if (json.ok) await load();
    } catch {
      setOtpHint("Ověření selhalo. Zkuste to znovu online.");
    }
  }

  const score = submitted && test
    ? (() => {
        let ok = 0;
        for (const q of test.questions) if (answers[q.id] === q.correct_answer.index) ok += 1;
        const pct = Math.round((ok / Math.max(test.questions.length, 1)) * 100);
        return { ok, total: test.questions.length, pct };
      })()
    : null;

  return (
    <div
      className="flex h-[100dvh] flex-col overflow-hidden bg-[#F4F7FB] text-[#0A192F]"
      style={{
        paddingTop: "env(safe-area-inset-top)",
        paddingLeft: "env(safe-area-inset-left)",
        paddingRight: "env(safe-area-inset-right)",
      }}
    >
      <header className="shrink-0 border-b border-[#1A2332] bg-[#0A192F] px-3 py-2.5 text-white sm:px-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2.5">
            <Image
              src={MEDIPREP.assets.icon192}
              alt={MEDIPREP.shortName}
              width={36}
              height={36}
              className="shrink-0 rounded-[22%] ring-1 ring-white/30"
            />
            <div className="min-w-0">
              <p className="truncate text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-100/90">
                {MEDIPREP.provider}
              </p>
              <h1 className="truncate text-base font-semibold leading-tight sm:text-lg">{MEDIPREP.shortName}</h1>
              <p className="truncate text-[10px] text-sky-100/70">{appLockline(MEDIPREP)}</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-medium ${
                online ? "bg-emerald-400/20 text-emerald-100" : "bg-amber-400/20 text-amber-100"
              }`}
            >
              {online ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
              {online ? "Online" : "Offline"}
            </span>
            <InstallPwaButton app={MEDIPREP} compact />
          </div>
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {loading ? (
          <p className="px-4 py-16 text-center text-sm text-slate-500">Načítám MeDiprep…</p>
        ) : tab === "prehled" ? (
          <div className="mx-auto w-full max-w-3xl space-y-4 px-3 py-3 sm:px-4">
            <section className="rounded-2xl border border-[#e0d5c4] bg-white p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#C45C26]">Dashboard</p>
              <h2 className="mt-1 font-display text-xl font-semibold">Zjisti mezery. Natrénuj je.</h2>
              <p className="mt-1 text-sm text-slate-600">
                Ukázkové skóre {dash.demoScore.pct} % ze {dash.demoScore.total} otázek · banka {dash.bank.total}{" "}
                originálních položek B/C/F. První test zdarma.
              </p>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                {(["biologie", "chemie", "fyzika"] as const).map((s) => (
                  <div key={s} className="rounded-xl bg-[#F8F4EA] px-2 py-2">
                    <p className="text-lg font-bold text-[#0A192F]">{dash.bank.bySubject[s] ?? 0}</p>
                    <p className="text-[10px] uppercase tracking-wide text-slate-500">{s}</p>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => void startTest()}
                className="mt-3 rounded-full bg-[#C45C26] px-5 py-2 text-sm font-semibold text-white"
              >
                Spustit první test
              </button>
            </section>
            <section className="rounded-2xl border border-slate-200 bg-white p-4">
              <h3 className="text-sm font-semibold">Slabá místa (ukázka)</h3>
              <ul className="mt-2 space-y-2">
                {dash.weakTopics.map((w) => (
                  <li key={w.topic} className="flex items-center justify-between text-sm">
                    <span>
                      {w.topic} <span className="text-slate-400">· {w.subject}</span>
                    </span>
                    <span className="font-semibold text-[#C45C26]">{w.pct} %</span>
                  </li>
                ))}
              </ul>
            </section>
            <section className="rounded-2xl border border-slate-200 bg-white p-4">
              <h3 className="text-sm font-semibold">Osm českých LF</h3>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {dash.faculties.map((f) => (
                  <button
                    key={f.slug}
                    type="button"
                    onClick={() => void startTest(f.slug)}
                    className="rounded-xl border border-slate-200 px-3 py-2 text-left text-sm hover:border-[#C45C26]/50"
                  >
                    <span className="font-semibold">{f.shortName}</span>
                    <span className="block text-xs text-slate-500">
                      {f.city} · {f.questions} otázek · {f.minutes} min
                    </span>
                  </button>
                ))}
              </div>
            </section>
            <section className="rounded-2xl border border-slate-200 bg-white p-4">
              <h3 className="text-sm font-semibold">Týdenní plán (ukázka)</h3>
              <ol className="mt-2 space-y-1.5 text-sm">
                {dash.weeklyPlan.slice(0, 4).map((row) => (
                  <li key={row.day} className="flex gap-3">
                    <span className="w-8 font-bold text-[#C45C26]">{row.day}</span>
                    <span>{row.task}</span>
                  </li>
                ))}
              </ol>
              <button type="button" className="mt-3 text-sm font-medium text-[#C45C26]" onClick={() => setTab("plan")}>
                Celý plán →
              </button>
            </section>
          </div>
        ) : tab === "testy" ? (
          <div className="mx-auto w-full max-w-3xl space-y-4 px-3 py-3 sm:px-4">
            {!test ? (
              <div className="rounded-2xl bg-white p-4">
                <h2 className="font-display text-xl font-semibold">Sestavit test</h2>
                <p className="mt-1 text-sm text-slate-600">Simulace nanečisto — ne oficiální zadání fakulty.</p>
                <button
                  type="button"
                  onClick={() => void startTest()}
                  className="mt-4 rounded-full bg-[#C45C26] px-5 py-2 text-sm font-semibold text-white"
                >
                  Mixed 12 otázek B/C/F
                </button>
              </div>
            ) : (
              <>
                <div className="rounded-2xl bg-white p-4">
                  <h2 className="font-display text-lg font-semibold">{test.title}</h2>
                  {score ? (
                    <p className="mt-2 text-sm">
                      Skóre {score.ok}/{score.total} · {score.pct} % {score.pct >= 70 ? "— splněno" : "— drill slabých míst"}
                    </p>
                  ) : (
                    <p className="mt-1 text-sm text-slate-500">{test.questions.length} otázek · odevzdejte najednou</p>
                  )}
                </div>
                {test.questions.map((q, idx) => (
                  <fieldset key={q.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                    <legend className="text-sm font-semibold">
                      {idx + 1}. {q.question_text}
                    </legend>
                    <div className="mt-2 space-y-1.5">
                      {q.options.map((opt, oi) => {
                        const chosen = answers[q.id] === oi;
                        const correct = submitted && oi === q.correct_answer.index;
                        const wrong = submitted && chosen && oi !== q.correct_answer.index;
                        return (
                          <label
                            key={opt}
                            className={`flex cursor-pointer items-start gap-2 rounded-lg px-2 py-1.5 text-sm ${
                              correct ? "bg-emerald-50" : wrong ? "bg-rose-50" : chosen ? "bg-slate-100" : ""
                            }`}
                          >
                            <input
                              type="radio"
                              name={q.id}
                              disabled={submitted}
                              checked={chosen}
                              onChange={() => setAnswers((a) => ({ ...a, [q.id]: oi }))}
                            />
                            {opt}
                          </label>
                        );
                      })}
                    </div>
                    {submitted && q.explanation ? (
                      <p className="mt-2 text-xs text-slate-600">{q.explanation}</p>
                    ) : null}
                  </fieldset>
                ))}
                {!submitted ? (
                  <button
                    type="button"
                    onClick={() => setSubmitted(true)}
                    className="mb-6 w-full rounded-full bg-[#0A192F] py-3 text-sm font-semibold text-white"
                  >
                    Odevzdat test
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => void startTest()}
                    className="mb-6 w-full rounded-full bg-[#C45C26] py-3 text-sm font-semibold text-white"
                  >
                    Další sada
                  </button>
                )}
              </>
            )}
          </div>
        ) : tab === "plan" ? (
          <div className="mx-auto w-full max-w-3xl space-y-3 px-3 py-4 sm:px-4">
            <h2 className="font-display text-xl font-semibold">Týdenní plán</h2>
            <ol className="space-y-2">
              {dash.weeklyPlan.map((row) => (
                <li key={row.day} className="flex gap-3 rounded-xl bg-white px-3 py-3 text-sm">
                  <span className="w-8 font-bold text-[#C45C26]">{row.day}</span>
                  <span>{row.task}</span>
                </li>
              ))}
            </ol>
          </div>
        ) : (
          <div className="mx-auto w-full max-w-3xl space-y-4 px-3 py-6 sm:px-4">
            <h2 className="font-display text-xl font-semibold">Účet</h2>
            <p className="text-sm text-slate-600">{session?.message}</p>
            {session?.authenticated ? (
              <p className="rounded-xl bg-white p-4 text-sm">{session.displayName || session.email}</p>
            ) : (
              <form
                className="space-y-2 rounded-2xl bg-white p-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  void requestCode();
                }}
              >
                <label className="text-sm font-medium">E-mail</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  placeholder="vas@email.cz"
                />
                <button type="submit" className="rounded-full bg-[#0A192F] px-4 py-2 text-sm text-white">
                  Poslat kód
                </button>
                <div className="flex gap-2">
                  <input
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm"
                    placeholder="6místný kód"
                  />
                  <button
                    type="button"
                    onClick={() => void verifyCode()}
                    className="rounded-full border px-4 py-2 text-sm"
                  >
                    Ověřit
                  </button>
                </div>
                {otpHint ? <p className="text-xs text-slate-600">{otpHint}</p> : null}
                <p className="text-xs text-slate-500">
                  Máte účet MedScope?{" "}
                  <Link href={session?.loginUrl || "/login?next=/app/priprava"} className="text-[#C45C26] underline">
                    Přihlásit heslem
                  </Link>
                </p>
              </form>
            )}
            <Link href="/predplatne#student" className="block text-sm font-medium text-[#C45C26]">
              Student LF 149 Kč · 14 dní zdarma →
            </Link>
          </div>
        )}
      </main>

      <nav
        className="shrink-0 border-t border-slate-200 bg-white/95 backdrop-blur"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="mx-auto grid max-w-3xl grid-cols-4">
          {TABS.map(({ id, label, icon: Icon }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={`flex flex-col items-center gap-0.5 px-1 py-2.5 text-[11px] font-medium ${
                  active ? "text-[#C45C26]" : "text-slate-500"
                }`}
              >
                <Icon className={`h-5 w-5 ${active ? "text-[#C45C26]" : "text-slate-400"}`} />
                {label}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
