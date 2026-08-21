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
  LogIn,
  Play,
  RotateCcw,
} from "lucide-react";
import { InstallPwaButton } from "@/components/apps/install-pwa-button";
import { AppAccountStatus } from "@/components/apps/app-account-status";
import { AppSectionNav } from "@/components/apps/app-section-nav";
import { AppBrandVisual } from "@/components/apps/app-brand-visual";
import { MEDIPREP, appLockline } from "@/lib/apps/catalog";
import { APP_MARKETING_IMAGE } from "@/lib/brand/marketing-visuals";
import { buildPrepTest, getPrepDashboard, type PrepDashboard } from "@/lib/mediprep/dashboard";
import { GUEST_PREP_SESSION } from "@/lib/mediprep/guest";
import type { PrepSession } from "@/lib/mediprep/types";
import type { GeneratedSelfTest } from "@/lib/prijimacky/quiz-from-bank";

type TabId = "prehled" | "testy" | "plan" | "ucet";
type TestMode = "cviceni" | "simulace" | "rychly";
type TestSubject = "mix" | "biologie" | "chemie" | "fyzika";

const TABS: { id: TabId; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "prehled", label: "Přehled", icon: LayoutDashboard },
  { id: "testy", label: "Testy", icon: GraduationCap },
  { id: "plan", label: "Plán", icon: CalendarRange },
  { id: "ucet", label: "Účet", icon: UserRound },
];

const MODES: { id: TestMode; label: string; hint: string }[] = [
  { id: "cviceni", label: "Cvičení", hint: "S vysvětlením" },
  { id: "simulace", label: "Simulace", hint: "Jako přijímačky" },
  { id: "rychly", label: "Rychlý", hint: "Krátký drill" },
];

const SUBJECTS: { id: TestSubject; label: string }[] = [
  { id: "mix", label: "Mix B/C/F" },
  { id: "biologie", label: "Biologie" },
  { id: "chemie", label: "Chemie" },
  { id: "fyzika", label: "Fyzika" },
];

const COUNTS = [8, 12, 20, 24, 40] as const;

function defaultCount(mode: TestMode): number {
  if (mode === "rychly") return 8;
  if (mode === "simulace") return 24;
  return 12;
}

function initialTab(): TabId {
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
  const [starting, setStarting] = useState(false);
  const [mode, setMode] = useState<TestMode>("cviceni");
  const [subject, setSubject] = useState<TestSubject>("mix");
  const [count, setCount] = useState(12);
  const [faculty, setFaculty] = useState("mix");

  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("tab");
    if (t === "prehled" || t === "testy" || t === "plan" || t === "ucet") setTab(t);
  }, []);

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

  useEffect(() => {
    setCount(defaultCount(mode));
  }, [mode]);

  const loginHref = session.loginUrl || `/login?next=${encodeURIComponent(MEDIPREP.appPath)}`;

  async function startTest(overrides?: {
    faculty?: string;
    mode?: TestMode;
    subject?: TestSubject;
    count?: number;
  }) {
    const m = overrides?.mode ?? mode;
    const s = overrides?.subject ?? subject;
    const c = overrides?.count ?? count;
    const f = overrides?.faculty ?? faculty;
    const subjectParam = s === "mix" ? "mixed" : s;
    setStarting(true);
    const fallback = () =>
      buildPrepTest({
        mode: m,
        subject: subjectParam,
        count: c,
        faculty: f || "mix",
        seed: `client-${m}-${s}-${f}-${c}`,
      });
    try {
      const qs = new URLSearchParams({
        mode: m,
        count: String(c),
        faculty: f || "mix",
        subject: subjectParam,
      });
      const res = await fetch(`/api/mediprep/test?${qs.toString()}`, {
        credentials: "same-origin",
      });
      if (!res.ok) {
        setTest(fallback());
      } else {
        const json = (await res.json()) as { test: GeneratedSelfTest };
        setTest(json.test ?? fallback());
      }
    } catch {
      setTest(fallback());
    }
    setAnswers({});
    setSubmitted(false);
    setTab("testy");
    setStarting(false);
  }

  function resetBuilder() {
    setTest(null);
    setAnswers({});
    setSubmitted(false);
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
      className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[#F4F7FB] text-[#0A192F]"
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
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <span
              className={`hidden items-center gap-1 rounded-full px-2 py-1 text-[10px] font-medium sm:inline-flex ${
                online ? "bg-emerald-400/20 text-emerald-100" : "bg-amber-400/20 text-amber-100"
              }`}
            >
              {online ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
              {online ? "Online" : "Offline"}
            </span>
            {session.authenticated ? (
              <button
                type="button"
                onClick={() => setTab("ucet")}
                className="inline-flex max-w-[9rem] items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1.5 text-[11px] font-semibold text-white touch-manipulation hover:bg-white/25"
              >
                <UserRound className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{session.displayName || session.email || "Účet"}</span>
              </button>
            ) : (
              <Link
                href={loginHref}
                className="inline-flex items-center gap-1 rounded-full bg-[#C45C26] px-2.5 py-1.5 text-[11px] font-bold text-white shadow-sm touch-manipulation hover:bg-[#a84c1f] sm:px-3 sm:text-xs"
              >
                <LogIn className="h-3.5 w-3.5" />
                Přihlášení
              </Link>
            )}
            <InstallPwaButton app={MEDIPREP} compact label="Stáhnout" />
          </div>
        </div>
      </header>

      <AppAccountStatus
        access={session.access ?? GUEST_PREP_SESSION.access}
        accent="#C45C26"
        onOpenAccount={() => setTab("ucet")}
      />

      <AppSectionNav
        tabs={TABS}
        active={tab}
        onChange={setTab}
        accent="#C45C26"
        ariaLabel="MeDiprep sekce"
      />

      <div className="mx-auto flex min-h-0 w-full max-w-5xl flex-1 overflow-hidden">
        <aside className="hidden w-48 shrink-0 flex-col gap-1 border-r border-slate-200 bg-white/90 p-3 lg:flex">
          <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Rychlé akce</p>
          <div className="flex flex-col gap-1">
            <button
              type="button"
              onClick={() => {
                resetBuilder();
                setTab("testy");
              }}
              className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 touch-manipulation hover:bg-slate-100"
            >
              <GraduationCap className="h-5 w-5 text-[#C45C26]" />
              Sestavit test
            </button>
            <button
              type="button"
              disabled={starting}
              onClick={() => {
                setMode("cviceni");
                setSubject("mix");
                setCount(12);
                void startTest({ mode: "cviceni", subject: "mix", count: 12, faculty: "mix" });
              }}
              className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 touch-manipulation hover:bg-slate-100 disabled:opacity-60"
            >
              <Play className="h-5 w-5 text-[#C45C26]" />
              Spustit rychle
            </button>
            <Link
              href={loginHref}
              className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              <LogIn className="h-5 w-5 text-[#C45C26]" />
              {session.authenticated ? "Účet" : "Přihlášení"}
            </Link>
          </div>
          <div className="mt-auto space-y-2 rounded-xl bg-[#0A192F] p-3 text-white">
            <div className="relative mb-2 aspect-[16/9] overflow-hidden rounded-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={APP_MARKETING_IMAGE.mediprep}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-sky-200/80">Stažení</p>
            <p className="text-[11px] leading-4 text-sky-100/85">Dejte si MeDiprep na plochu telefonu i PC.</p>
            <InstallPwaButton app={MEDIPREP} label="Stáhnout na mobil" />
          </div>
        </aside>
      <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-[calc(4.25rem+env(safe-area-inset-bottom))] md:pb-0">
        {loading ? (
          <p className="px-4 py-16 text-center text-sm text-slate-500">Načítám MeDiprep…</p>
        ) : tab === "prehled" ? (
          <div className="mx-auto w-full max-w-3xl space-y-4 pb-3 pt-0 sm:px-0">
            <AppBrandVisual
              app={MEDIPREP}
              className="border-b border-[#e0d5c4] sm:mx-4 sm:mt-3 sm:rounded-2xl sm:border"
            />
            <div className="space-y-4 px-3 sm:px-4">
            <section className="rounded-2xl border border-[#e0d5c4] bg-white p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#C45C26]">Dashboard</p>
              <h2 className="mt-1 font-display text-xl font-semibold">Zjisti mezery. Natrénuj je.</h2>
              <p className="mt-1 text-sm text-slate-600">
                Ukázkové skóre {dash.demoScore.pct} % ze {dash.demoScore.total} otázek · banka {dash.bank.total}{" "}
                originálních položek B/C/F. První test zdarma.
              </p>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                {(["biologie", "chemie", "fyzika"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      setSubject(s);
                      setMode("cviceni");
                      setCount(12);
                      void startTest({ subject: s, mode: "cviceni", count: 12 });
                    }}
                    className="rounded-xl bg-[#F8F4EA] px-2 py-2.5 touch-manipulation active:scale-[0.98]"
                  >
                    <p className="text-lg font-bold text-[#0A192F]">{dash.bank.bySubject[s] ?? 0}</p>
                    <p className="text-[10px] uppercase tracking-wide text-slate-500">{s}</p>
                  </button>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={starting}
                  onClick={() => {
                    setMode("cviceni");
                    setSubject("mix");
                    setCount(12);
                    void startTest({ mode: "cviceni", subject: "mix", count: 12, faculty: "mix" });
                  }}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#C45C26] px-5 py-2.5 text-sm font-semibold text-white touch-manipulation sm:flex-none"
                >
                  <Play className="h-4 w-4" />
                  Spustit první test
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetBuilder();
                    setTab("testy");
                  }}
                  className="rounded-full border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 touch-manipulation"
                >
                  Nastavit test →
                </button>
              </div>
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
                    onClick={() => {
                      setFaculty(f.slug);
                      setMode("simulace");
                      setSubject("mix");
                      setCount(12);
                      void startTest({ faculty: f.slug, mode: "simulace", subject: "mix", count: 12 });
                    }}
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
          </div>
        ) : tab === "testy" ? (
          <div className="mx-auto w-full max-w-3xl space-y-4 px-3 py-3 sm:px-4">
            {!test ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                <h2 className="font-display text-xl font-semibold">Sestavit test</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Zvolte typ, předmět, počet otázek a volitelně fakultu — pak spusťte.
                </p>
                <fieldset className="mt-4">
                  <legend className="text-xs font-semibold uppercase tracking-wider text-slate-500">Typ testu</legend>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {MODES.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setMode(m.id)}
                        className={`rounded-xl border px-2 py-2.5 text-center touch-manipulation ${
                          mode === m.id
                            ? "border-[#C45C26] bg-[#C45C26]/10 text-[#0A192F]"
                            : "border-slate-200 bg-slate-50 text-slate-600"
                        }`}
                      >
                        <span className="block text-sm font-semibold">{m.label}</span>
                        <span className="mt-0.5 block text-[10px] leading-tight text-slate-500">{m.hint}</span>
                      </button>
                    ))}
                  </div>
                </fieldset>
                <fieldset className="mt-4">
                  <legend className="text-xs font-semibold uppercase tracking-wider text-slate-500">Předmět</legend>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {SUBJECTS.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setSubject(s.id)}
                        className={`rounded-full px-3 py-1.5 text-sm font-medium touch-manipulation ${
                          subject === s.id ? "bg-[#0A192F] text-white" : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </fieldset>
                <fieldset className="mt-4">
                  <legend className="text-xs font-semibold uppercase tracking-wider text-slate-500">Počet otázek</legend>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {COUNTS.map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setCount(n)}
                        className={`min-w-[3rem] rounded-full px-3 py-1.5 text-sm font-semibold touch-manipulation ${
                          count === n
                            ? "bg-[#C45C26] text-white"
                            : "border border-slate-200 bg-white text-slate-700"
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </fieldset>
                <fieldset className="mt-4">
                  <legend className="text-xs font-semibold uppercase tracking-wider text-slate-500">Fakulta (volitelné)</legend>
                  <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                    <button
                      type="button"
                      onClick={() => setFaculty("mix")}
                      className={`rounded-xl border px-3 py-2 text-left text-sm touch-manipulation ${
                        faculty === "mix"
                          ? "border-[#C45C26] bg-[#C45C26]/10 font-semibold"
                          : "border-slate-200"
                      }`}
                    >
                      Mix LF
                    </button>
                    {dash.faculties.map((f) => (
                      <button
                        key={f.slug}
                        type="button"
                        onClick={() => setFaculty(f.slug)}
                        className={`rounded-xl border px-3 py-2 text-left text-sm touch-manipulation ${
                          faculty === f.slug
                            ? "border-[#C45C26] bg-[#C45C26]/10 font-semibold"
                            : "border-slate-200"
                        }`}
                      >
                        {f.shortName}
                      </button>
                    ))}
                  </div>
                </fieldset>
                <button
                  type="button"
                  disabled={starting}
                  onClick={() => void startTest()}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-[#C45C26] py-3 text-sm font-semibold text-white touch-manipulation disabled:opacity-60"
                >
                  <Play className="h-4 w-4" />
                  {starting
                    ? "Připravuji…"
                    : `Spustit · ${SUBJECTS.find((s) => s.id === subject)?.label} · ${count} otázek`}
                </button>
              </div>
            ) : (
              <>
                <div className="sticky top-0 z-10 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-sm backdrop-blur">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h2 className="font-display text-lg font-semibold leading-snug">{test.title}</h2>
                      {score ? (
                        <p className="mt-1 text-sm font-medium">
                          Skóre {score.ok}/{score.total} · {score.pct} %{" "}
                          {score.pct >= 70 ? "— splněno" : "— drill slabých míst"}
                        </p>
                      ) : (
                        <p className="mt-1 text-sm text-slate-500">
                          {test.questions.length} otázek · odevzdejte najednou
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={resetBuilder}
                      className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 touch-manipulation"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Nový test
                    </button>
                  </div>
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
                  <div className="mb-6 flex flex-col gap-2 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => void startTest()}
                      className="flex-1 rounded-full bg-[#C45C26] py-3 text-sm font-semibold text-white touch-manipulation"
                    >
                      Další sada (stejné nastavení)
                    </button>
                    <button
                      type="button"
                      onClick={resetBuilder}
                      className="flex-1 rounded-full border border-slate-300 bg-white py-3 text-sm font-semibold text-slate-700 touch-manipulation"
                    >
                      Změnit typ testu
                    </button>
                  </div>
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
            <AppBrandVisual app={MEDIPREP} compact className="rounded-2xl border border-[#e0d5c4]" />
            <h2 className="font-display text-xl font-semibold">Účet</h2>
            <p className="text-sm text-slate-600">{session?.message}</p>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm space-y-2">
              <p>
                <span className="text-slate-500">Účet: </span>
                <strong>{session.access?.accountLabel ?? session.displayName ?? "Nepřihlášeni"}</strong>
              </p>
              <p>
                <span className="text-slate-500">Přístup: </span>
                <strong>{session.access?.planLabel ?? "—"}</strong>
              </p>
              <p>
                <span className="text-slate-500">Platnost: </span>
                <strong>{session.access?.validityLabel ?? "—"}</strong>
              </p>
            </div>
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
                  <Link href={loginHref} className="text-[#C45C26] underline">
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
      </div>
    </div>
  );
}
