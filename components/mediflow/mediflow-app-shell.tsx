"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Bookmark,
  Activity,
  Pill,
  StickyNote,
  UserRound,
  Wifi,
  WifiOff,
  LogIn,
  Crown,
  FileDown,
} from "lucide-react";
import { InstallPwaButton } from "@/components/apps/install-pwa-button";
import { AppAccountStatus } from "@/components/apps/app-account-status";
import { AppSectionNav } from "@/components/apps/app-section-nav";
import type { AppAccessInfo } from "@/lib/apps/access-status";
import { MEDIFLOW, appLockline } from "@/lib/apps/catalog";
import {
  GUEST_MEDIFLOW_SESSION,
  demoMediFlowDashboard,
  MEDIFLOW_STORAGE_KEY,
  type MediFlowDashboard,
  type MediFlowNote,
  type MediFlowSession,
  type MediFlowSymptom,
  type MediFlowSupplement,
} from "@/lib/mediflow/types";

type TabId = "prehled" | "clanky" | "symptomy" | "suplementy" | "poznamky" | "ucet";

const TABS: { id: TabId; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "prehled", label: "Přehled", icon: LayoutDashboard },
  { id: "clanky", label: "Články", icon: Bookmark },
  { id: "symptomy", label: "Symptomy", icon: Activity },
  { id: "suplementy", label: "Suplementy", icon: Pill },
  { id: "poznamky", label: "Poznámky", icon: StickyNote },
  { id: "ucet", label: "Účet", icon: UserRound },
];

const DISCLAIMER =
  "MediFlow neslouží k diagnostice. Sledujte symptomy pro vlastní přehled a sdílejte s lékařem.";

function loadLocal(): MediFlowDashboard | null {
  try {
    const raw = localStorage.getItem(MEDIFLOW_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as MediFlowDashboard) : null;
  } catch {
    return null;
  }
}

function saveLocal(data: MediFlowDashboard) {
  try {
    localStorage.setItem(MEDIFLOW_STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* quota exceeded */
  }
}

type ApiDashboardResponse = {
  session: MediFlowSession & { access?: AppAccessInfo; userId?: string | null };
  dashboard: MediFlowDashboard;
};

export function MediFlowAppShell() {
  const [tab, setTab] = useState<TabId>("prehled");
  const [online, setOnline] = useState(true);
  const [session, setSession] = useState<MediFlowSession>(GUEST_MEDIFLOW_SESSION);
  const [apiAccess, setApiAccess] = useState<AppAccessInfo | null>(null);
  const [dash, setDash] = useState<MediFlowDashboard>(() => demoMediFlowDashboard());
  const [authenticated, setAuthenticated] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);
  const [newNote, setNewNote] = useState("");
  const [newSymptom, setNewSymptom] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/mediflow/dashboard", { credentials: "same-origin" });
      if (!res.ok) throw new Error("dashboard fetch failed");
      const json = (await res.json()) as ApiDashboardResponse;
      if (json.session) {
        setSession(json.session);
        setApiAccess(json.session.access ?? null);
        setAuthenticated(Boolean(json.session.userId) || !json.session.isGuest);
      }
      if (json.dashboard) setDash(json.dashboard);
    } catch {
      const saved = loadLocal();
      if (saved) setDash(saved);
      setSession(GUEST_MEDIFLOW_SESSION);
      setApiAccess(null);
      setAuthenticated(false);
      setFlash("Offline režim — data jsou uložena lokálně.");
    }
  }, []);

  useEffect(() => {
    void load();
    setOnline(navigator.onLine);
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, [load]);

  useEffect(() => {
    if (!authenticated) saveLocal(dash);
  }, [dash, authenticated]);

  const showFlash = (msg: string) => {
    setFlash(msg);
    setTimeout(() => setFlash(null), 3000);
  };

  const addNote = useCallback(async () => {
    if (!newNote.trim()) return;
    const text = newNote.trim();
    setNewNote("");

    if (authenticated) {
      try {
        const res = await fetch("/api/mediflow/notes", {
          method: "POST",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });
        const json = (await res.json()) as { note?: MediFlowNote; error?: string };
        if (res.ok && json.note) {
          setDash((d) => ({ ...d, notes: [json.note!, ...d.notes] }));
          showFlash("Poznámka uložena");
          return;
        }
        showFlash(json.error ?? "Ukládání selhalo — zkuste znovu.");
        return;
      } catch {
        showFlash("Síťová chyba — poznámka zůstává lokálně.");
      }
    }

    const now = new Date().toISOString();
    const note: MediFlowNote = {
      id: `n-${Date.now()}`,
      title: text.slice(0, 50),
      body: text,
      createdAt: now,
      updatedAt: now,
    };
    setDash((d) => ({ ...d, notes: [note, ...d.notes] }));
    showFlash("Poznámka uložena lokálně");
  }, [newNote, authenticated]);

  const addSymptom = useCallback(async () => {
    if (!newSymptom.trim()) return;
    const name = newSymptom.trim();
    setNewSymptom("");

    if (authenticated) {
      try {
        const res = await fetch("/api/mediflow/symptoms", {
          method: "POST",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, severity: 3 }),
        });
        const json = (await res.json()) as { symptom?: MediFlowSymptom; error?: string };
        if (res.ok && json.symptom) {
          setDash((d) => ({ ...d, symptoms: [json.symptom!, ...d.symptoms] }));
          showFlash("Symptom zaznamenán");
          return;
        }
        showFlash(json.error ?? "Ukládání selhalo — zkuste znovu.");
        return;
      } catch {
        showFlash("Síťová chyba — symptom zůstává lokálně.");
      }
    }

    const symptom: MediFlowSymptom = {
      id: `s-${Date.now()}`,
      name,
      severity: 3,
      loggedAt: new Date().toISOString(),
    };
    setDash((d) => ({ ...d, symptoms: [symptom, ...d.symptoms] }));
    showFlash("Symptom zaznamenán lokálně");
  }, [newSymptom, authenticated]);

  const toggleSupplement = useCallback(
    async (id: string) => {
      const current = dash.supplements.find((s) => s.id === id);
      if (!current) return;
      const takenToday = !current.takenToday;

      setDash((d) => ({
        ...d,
        supplements: d.supplements.map((s) => (s.id === id ? { ...s, takenToday } : s)),
      }));

      if (!authenticated) return;

      try {
        const res = await fetch(`/api/mediflow/supplements/${id}`, {
          method: "PATCH",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ takenToday }),
        });
        if (!res.ok) {
          setDash((d) => ({
            ...d,
            supplements: d.supplements.map((s) =>
              s.id === id ? { ...s, takenToday: !takenToday } : s
            ),
          }));
          showFlash("Synchronizace suplementu selhala.");
        }
      } catch {
        setDash((d) => ({
          ...d,
          supplements: d.supplements.map((s) =>
            s.id === id ? { ...s, takenToday: !takenToday } : s
          ),
        }));
        showFlash("Síťová chyba — změna zůstává lokálně.");
      }
    },
    [authenticated, dash.supplements]
  );

  const accessInfo: AppAccessInfo = apiAccess ?? {
    authenticated: !session.isGuest,
    accountLabel: session.isGuest ? "Host" : session.email ?? "Účet",
    email: session.email,
    planLabel: session.isVip ? "VIP" : "Zdarma",
    entitled: session.isVip,
    validUntil: null,
    validityLabel: session.isVip ? "Aktivní" : "—",
    loginUrl: "/login?next=/app/mediflow",
    subscribeUrl: "/predplatne",
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#0a1628] text-white">
      {/* Header */}
      <header className="shrink-0 border-b border-white/10 bg-[#0a1628]/95 px-4 py-3 backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-xs font-bold">
              MF
            </div>
            <div>
              <p className="text-sm font-bold">{MEDIFLOW.shortName}</p>
              <p className="text-[10px] text-white/50">{appLockline(MEDIFLOW)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {online ? (
              <Wifi className="h-4 w-4 text-emerald-400" aria-label="Online" />
            ) : (
              <WifiOff className="h-4 w-4 text-amber-400" aria-label="Offline" />
            )}
            <InstallPwaButton app={MEDIFLOW} compact />
          </div>
        </div>
        <AppAccountStatus access={accessInfo} />
      </header>

      {flash ? (
        <div className="mx-4 mt-2 rounded-lg bg-emerald-600/90 px-3 py-2 text-center text-xs font-medium">
          {flash}
        </div>
      ) : null}

      {/* Content */}
      <main className="min-h-0 flex-1 overflow-y-auto px-4 py-4 pb-24">
        {tab === "prehled" && (
          <div className="space-y-4">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-wider text-white/50">Streak</p>
              <p className="text-3xl font-bold text-emerald-400">{dash.streakDays} dní</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
                <p className="text-2xl font-bold">{dash.notes.length}</p>
                <p className="text-xs text-white/60">Poznámky</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
                <p className="text-2xl font-bold">{dash.savedArticles.length}</p>
                <p className="text-xs text-white/60">Články</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
                <p className="text-2xl font-bold">{dash.symptoms.length}</p>
                <p className="text-xs text-white/60">Symptomy</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
                <p className="text-2xl font-bold">
                  {dash.supplements.filter((s) => s.takenToday).length}/{dash.supplements.length}
                </p>
                <p className="text-xs text-white/60">Suplementy dnes</p>
              </div>
            </div>
            <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-200">
              {DISCLAIMER}
            </p>
          </div>
        )}

        {tab === "clanky" && (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold">Uložené články</h2>
            {dash.savedArticles.map((a) => (
              <Link
                key={a.id}
                href={`/article/${a.articleSlug}`}
                className="block rounded-xl border border-white/10 bg-white/5 p-3 hover:bg-white/10"
              >
                <p className="font-medium">{a.articleTitle}</p>
                {a.excerpt ? <p className="mt-1 text-xs text-white/60">{a.excerpt}</p> : null}
              </Link>
            ))}
            <Link href="/articles" className="block text-center text-xs text-emerald-400 hover:underline">
              Procházet magazín →
            </Link>
          </div>
        )}

        {tab === "symptomy" && (
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                value={newSymptom}
                onChange={(e) => setNewSymptom(e.target.value)}
                placeholder="Název symptomu…"
                className="flex-1 rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm placeholder:text-white/40"
              />
              <button
                type="button"
                onClick={addSymptom}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium hover:bg-emerald-500"
              >
                +
              </button>
            </div>
            {dash.symptoms.map((s) => (
              <div key={s.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{s.name}</p>
                  <span className="text-xs text-white/50">
                    Intenzita: {s.severity}/5
                  </span>
                </div>
              </div>
            ))}
            <p className="text-[11px] text-white/40">{DISCLAIMER}</p>
          </div>
        )}

        {tab === "suplementy" && (
          <div className="space-y-3">
            {dash.supplements.map((s: MediFlowSupplement) => (
              <button
                key={s.id}
                type="button"
                onClick={() => toggleSupplement(s.id)}
                className={`w-full rounded-xl border p-3 text-left transition ${
                  s.takenToday
                    ? "border-emerald-500/50 bg-emerald-500/10"
                    : "border-white/10 bg-white/5"
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium">{s.name}</p>
                  <span className={`text-xs ${s.takenToday ? "text-emerald-400" : "text-white/40"}`}>
                    {s.takenToday ? "✓ Vzato" : "Ne"}
                  </span>
                </div>
                <p className="mt-1 text-xs text-white/60">
                  {s.dosage} · {s.frequency}
                </p>
              </button>
            ))}
            <Link href="/vip/protokoly" className="block text-center text-xs text-emerald-400 hover:underline">
              VIP protokoly →
            </Link>
          </div>
        )}

        {tab === "poznamky" && (
          <div className="space-y-3">
            <div className="flex gap-2">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Nová poznámka…"
                rows={2}
                className="flex-1 rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm placeholder:text-white/40"
              />
              <button
                type="button"
                onClick={addNote}
                className="self-end rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium hover:bg-emerald-500"
              >
                Uložit
              </button>
            </div>
            {dash.notes.map((n) => (
              <div key={n.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
                <p className="font-medium">{n.title}</p>
                <p className="mt-1 text-xs text-white/60">{n.body}</p>
              </div>
            ))}
          </div>
        )}

        {tab === "ucet" && (
          <div className="space-y-4">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm font-semibold">Účet</p>
              <p className="mt-1 text-xs text-white/60">
                {session.isGuest ? "Přihlaste se pro synchronizaci mezi zařízeními." : session.email}
              </p>
              {session.isGuest ? (
                <Link
                  href="/login?next=/app/mediflow"
                  className="mt-3 inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm hover:bg-white/20"
                >
                  <LogIn className="h-4 w-4" /> Přihlásit
                </Link>
              ) : null}
            </div>
            {!session.isVip ? (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
                <div className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-amber-400" />
                  <p className="font-semibold">VIP MediFlow</p>
                </div>
                <p className="mt-2 text-xs text-white/70">
                  Export do PDF, synchronizace mezi zařízeními, VIP protokoly.
                </p>
                <Link
                  href="/predplatne"
                  className="mt-3 inline-block rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-black hover:bg-amber-400"
                >
                  Upgradovat na VIP
                </Link>
              </div>
            ) : (
              <button
                type="button"
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3 text-sm hover:bg-white/10"
              >
                <FileDown className="h-4 w-4" /> Export do PDF (VIP)
              </button>
            )}
            <InstallPwaButton app={MEDIFLOW} />
          </div>
        )}
      </main>

      <AppSectionNav tabs={TABS} active={tab} onChange={setTab} ariaLabel="MediFlow sekce" />
    </div>
  );
}
