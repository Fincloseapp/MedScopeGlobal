"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { BookOpen, Gauge, GraduationCap, LogOut, Puzzle, Target, Wifi, WifiOff } from "lucide-react";
import { MeDiprepMark } from "@/components/prep/mediprep-mark";
import { MeDiprepInstallButton } from "@/components/prep/mediprep-install-button";
import { MeDiprepOnboarding } from "@/components/prep/mediprep-onboarding";
import { MeDiprepSiteStrip } from "@/components/prep/mediprep-site-strip";
import { MeDiprepTestTab } from "@/components/prep/mediprep-test-tab";
import { PrepDashboard } from "@/components/prep/dashboard-view";
import { PrepGamesView } from "@/components/prep/games-view";
import { PREP_CHAPTERS } from "@/lib/prep/curriculum";
import { questionsForChapter } from "@/lib/prep/questions";
import { generatePrepTest } from "@/lib/prep/engine";
import { PrepExamPlayer } from "@/components/prep/exam-player";
import { getChapter } from "@/lib/prep/curriculum";
import { MEDIPREP } from "@/lib/prep/branding";
import { subjectLabel } from "@/lib/prijimacky/faculties-admissions";
import { usePrepProgress, bindPrepProgressUser } from "@/components/prep/progress-store";
import { useMeDiprepEntitlement } from "@/components/prep/use-mediprep-entitlement";
import { MeDiprepPaywall } from "@/components/prep/mediprep-paywall";
import { canStartPrepMode } from "@/lib/prep/entitlement";

type TabId = "plan" | "testy" | "uceni" | "hry" | "ucet";

const TABS: { id: TabId; label: string; icon: typeof Gauge }[] = [
  { id: "plan", label: "Plán", icon: Gauge },
  { id: "testy", label: "Testy", icon: Target },
  { id: "uceni", label: "Učení", icon: BookOpen },
  { id: "hry", label: "Hry", icon: Puzzle },
  { id: "ucet", label: "Účet", icon: GraduationCap },
];

function LearnTab({ chapterId, onBack }: { chapterId?: string; onBack: () => void }) {
  const { progress } = usePrepProgress();
  const { entitled } = useMeDiprepEntitlement();
  const chapter = chapterId ? getChapter(chapterId) : undefined;
  const learnGate = chapterId ? canStartPrepMode("learn", progress.attempts, entitled) : { ok: true as const };
  const test = useMemo(() => {
    if (!chapterId) return null;
    const ch = getChapter(chapterId);
    if (!ch) return null;
    return generatePrepTest({
      mode: "learn",
      chapterId: ch.id,
      subjects: [ch.subject],
      count: 8,
      minutes: null,
      seed: `learn-${ch.id}`,
    });
  }, [chapterId]);

  if (chapterId) {
    if (!learnGate.ok) return <MeDiprepPaywall reason={learnGate.reason} />;
    if (!chapter || !test) return <p className="p-6 text-sm">Kapitola nenalezena.</p>;
    return (
      <div className="space-y-6 px-4 py-6">
        <button type="button" className="text-sm text-[#C45C26]" onClick={onBack}>
          ← Kapitoly
        </button>
        <header>
          <h2 className="font-display text-2xl font-semibold">{chapter.title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-[#3d4a5c]">{chapter.summary}</p>
          <p className="mt-3 rounded-xl bg-white px-3 py-2 text-sm text-[#2F6B5A] ring-1 ring-[#e0d5c4]">
            {chapter.studyHint}
          </p>
        </header>
        <PrepExamPlayer test={test} immediateFeedback />
      </div>
    );
  }

  const groups = ["biologie", "chemie", "fyzika"] as const;
  return (
    <div className="space-y-8 px-4 py-6">
      <h2 className="font-display text-2xl font-semibold">Kapitoly</h2>
      {groups.map((subject) => (
        <section key={subject}>
          <h3 className="font-display text-lg font-semibold">{subjectLabel(subject)}</h3>
          <div className="mt-3 space-y-2">
            {PREP_CHAPTERS.filter((c) => c.subject === subject).map((c) => (
              <Link
                key={c.id}
                href={`/app/priprava?tab=uceni&chapter=${c.id}`}
                className="block rounded-xl border border-[#e0d5c4] bg-white p-4"
              >
                <p className="font-medium">{c.title}</p>
                <p className="mt-1 line-clamp-2 text-xs text-[#6b6256]">{c.summary}</p>
                <p className="mt-2 text-[11px] text-[#C45C26]">{questionsForChapter(c.id).length} otázek</p>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function AccountTab({ email, onLogout }: { email: string | null; onLogout: () => void }) {
  return (
    <div className="space-y-5 px-4 py-8">
      <h2 className="font-display text-2xl font-semibold">Účet MeDiprep</h2>
      <p className="text-sm text-[#5a5348]">{email || "Přihlášeni e-mailem."}</p>
      <p className="text-sm text-[#5a5348]">
        Stejný účet MedScopeGlobal funguje na telefonu i PC. Předplatné Student: {MEDIPREP.priceMonthlyCzk} Kč/měsíc.
      </p>
      <div className="flex flex-col gap-2">
        <MeDiprepInstallButton variant="hero" />
        <Link
          href="/predplatne?trial=1#student"
          className="rounded-full bg-[#22a05a] px-4 py-2.5 text-center text-sm font-semibold text-white"
        >
          {MEDIPREP.trialDays} dní zdarma · Student {MEDIPREP.priceMonthlyCzk} Kč
        </Link>
        <Link href="/predplatne#student" className="rounded-full border border-[#e0d5c4] bg-white px-4 py-2.5 text-center text-sm">
          Porovnat předplatné
        </Link>
        <button
          type="button"
          onClick={onLogout}
          className="inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm text-rose-800"
        >
          <LogOut className="h-4 w-4" />
          Odhlásit
        </button>
      </div>
    </div>
  );
}

export function MeDiprepAppShell() {
  const router = useRouter();
  const search = useSearchParams();
  const [online, setOnline] = useState(true);
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [autoInstall, setAutoInstall] = useState(false);

  const tab = (["plan", "testy", "uceni", "hry", "ucet"] as TabId[]).includes(search.get("tab") as TabId)
    ? (search.get("tab") as TabId)
    : search.get("mode")
      ? "testy"
      : "plan";
  const chapter = search.get("chapter") || undefined;

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/mediprep/session", { credentials: "same-origin" });
      const data = (await res.json()) as {
        authenticated?: boolean;
        email?: string | null;
        userId?: string | null;
      };
      setAuthed(Boolean(data.authenticated));
      setEmail(data.email ?? null);
      bindPrepProgressUser(data.authenticated ? data.userId ?? null : null);
    } catch {
      bindPrepProgressUser(null);
      setAuthed(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setOnline(navigator.onLine);
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    if (new URLSearchParams(window.location.search).get("install") === "1") setAutoInstall(true);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function logout() {
    await fetch("/api/mediprep/session", { method: "DELETE", credentials: "same-origin" });
    bindPrepProgressUser(null);
    setAuthed(false);
    setEmail(null);
  }

  return (
    <div
      className="flex h-[100dvh] flex-col overflow-hidden bg-[#F4F7FB] text-[#0A192F]"
      style={{
        paddingTop: "env(safe-area-inset-top)",
        paddingLeft: "env(safe-area-inset-left)",
        paddingRight: "env(safe-area-inset-right)",
      }}
    >
      <MeDiprepSiteStrip />

      <header className="shrink-0 border-b border-white/10 bg-[#0A192F] px-3 py-2.5 text-white sm:px-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2.5">
            <MeDiprepMark size="sm" className="shrink-0 rounded-[22%] ring-1 ring-white/20" />
            <div className="min-w-0">
              <p className="truncate text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-200/90">
                {MEDIPREP.provider}
              </p>
              <h1 className="truncate text-base font-semibold leading-tight">{MEDIPREP.shortName}</h1>
              <p className="truncate text-[10px] text-lime-300/90">{MEDIPREP.lockline}</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-medium ${
                online ? "bg-emerald-400/20 text-emerald-50" : "bg-amber-400/20 text-amber-50"
              }`}
            >
              {online ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
              {online ? "Online" : "Offline"}
            </span>
            <MeDiprepInstallButton autoOpen={autoInstall} />
          </div>
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {loading ? (
          <p className="px-4 py-16 text-center text-sm text-[#6b6256]">Načítám MeDiprep…</p>
        ) : !authed ? (
          <MeDiprepOnboarding onComplete={() => void refresh()} />
        ) : tab === "plan" ? (
          <PrepDashboard />
        ) : tab === "testy" ? (
          <MeDiprepTestTab
            initial={{
              mode: search.get("mode") || undefined,
              subject: search.get("subject") || undefined,
              faculty: search.get("faculty") || undefined,
              count: search.get("count") || undefined,
              topic: search.get("topic") || undefined,
            }}
          />
        ) : tab === "uceni" ? (
          <LearnTab chapterId={chapter} onBack={() => router.push("/app/priprava?tab=uceni")} />
        ) : tab === "hry" ? (
          <PrepGamesView />
        ) : (
          <AccountTab email={email} onLogout={() => void logout()} />
        )}
      </main>

      {authed ? (
        <nav
          className="shrink-0 border-t border-[#0A192F]/10 bg-white"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <div className="mx-auto grid max-w-3xl grid-cols-5">
            {TABS.map((t) => {
              const Icon = t.icon;
              const on = tab === t.id;
              return (
                <Link
                  key={t.id}
                  href={`/app/priprava?tab=${t.id}`}
                  className={`flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium ${
                    on ? "text-[#0A192F]" : "text-slate-500"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {t.label}
                </Link>
              );
            })}
          </div>
        </nav>
      ) : null}
    </div>
  );
}
