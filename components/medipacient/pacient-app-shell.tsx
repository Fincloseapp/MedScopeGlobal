"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  LayoutDashboard,
  FileText,
  Upload,
  UserRound,
  Wifi,
  WifiOff,
  FlaskConical,
  Pill,
  CalendarClock,
  ShieldAlert,
} from "lucide-react";
import { InstallPwaButton } from "@/components/apps/install-pwa-button";
import { MEDIPACIENT, appLockline } from "@/lib/apps/catalog";
import type { PacientDashboard, PacientDocument } from "@/lib/medipacient/types";
import type { PacientSession } from "@/lib/medipacient/session";

type TabId = "prehled" | "zpravy" | "nahrat" | "ucet";

const TABS: { id: TabId; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "prehled", label: "Přehled", icon: LayoutDashboard },
  { id: "zpravy", label: "Zprávy", icon: FileText },
  { id: "nahrat", label: "Nahrát", icon: Upload },
  { id: "ucet", label: "Účet", icon: UserRound },
];

function initialTab(): TabId {
  if (typeof window === "undefined") return "prehled";
  const t = new URLSearchParams(window.location.search).get("tab");
  if (t === "prehled" || t === "zpravy" || t === "nahrat" || t === "ucet") return t;
  return "prehled";
}

function formatCs(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("cs-CZ", { day: "numeric", month: "numeric", year: "numeric" });
  } catch {
    return iso;
  }
}

export function PacientAppShell() {
  const [tab, setTab] = useState<TabId>(initialTab);
  const [online, setOnline] = useState(true);
  const [session, setSession] = useState<PacientSession | null>(null);
  const [dash, setDash] = useState<PacientDashboard | null>(null);
  const [selected, setSelected] = useState<PacientDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);

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
      const [sRes, tRes] = await Promise.all([
        fetch("/api/medipacient/session", { credentials: "same-origin" }),
        fetch("/api/medipacient/timeline", { credentials: "same-origin" }),
      ]);
      if (sRes.ok) setSession((await sRes.json()) as PacientSession);
      if (tRes.ok) {
        const json = (await tRes.json()) as PacientDashboard;
        setDash(json);
      }
    } catch {
      setFlash("Nepodařilo se načíst přehled. Zkušební zprávy zkusím znovu.");
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

  async function onUpload(file: File) {
    if (!session?.canUpload) {
      setFlash("Pro nahrání vlastní zprávy se přihlaste. Zkušební osu už vidíte v přehledu.");
      setTab("ucet");
      return;
    }
    setUploading(true);
    setFlash(null);
    try {
      const body = new FormData();
      body.set("file", file);
      const res = await fetch("/api/medipacient/uploadReport", {
        method: "POST",
        credentials: "same-origin",
        body,
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) {
        setFlash(json.error || "Nahrání selhalo.");
        return;
      }
      setFlash("Zpráva je v časové ose. Diagnózy, léky a kontroly jsou v přehledu.");
      setTab("prehled");
      await load();
    } catch {
      setFlash("Síťová chyba. Bez dat se soubor zařadí do fronty až po připojení — zkuste znovu online.");
    } finally {
      setUploading(false);
    }
  }

  const kpis = useMemo(() => {
    if (!dash) return [];
    return [
      { label: "Zprávy v ose", value: dash.stats.reports, icon: FileText },
      { label: "Diagnózy", value: dash.stats.diagnoses, icon: ShieldAlert },
      { label: "Léky", value: dash.stats.meds, icon: Pill },
      { label: "Kontroly", value: dash.stats.upcoming, icon: CalendarClock },
    ];
  }, [dash]);

  return (
    <div
      className="flex h-[100dvh] flex-col overflow-hidden bg-[#f4f9fc] text-[#021d33]"
      style={{
        paddingTop: "env(safe-area-inset-top)",
        paddingLeft: "env(safe-area-inset-left)",
        paddingRight: "env(safe-area-inset-right)",
      }}
    >
      <header className="shrink-0 border-b border-[#1b4f9a] bg-[#2D7FF9] px-3 py-2.5 text-white sm:px-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2.5">
            <Image
              src={MEDIPACIENT.assets.icon192}
              alt={MEDIPACIENT.shortName}
              width={36}
              height={36}
              className="shrink-0 rounded-[22%] ring-1 ring-white/30"
            />
            <div className="min-w-0">
              <p className="truncate text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-100/90">
                {MEDIPACIENT.provider}
              </p>
              <h1 className="truncate text-base font-semibold leading-tight sm:text-lg">{MEDIPACIENT.shortName}</h1>
              <p className="truncate text-[10px] text-sky-100/70">{appLockline(MEDIPACIENT)}</p>
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
            <InstallPwaButton app={MEDIPACIENT} compact />
          </div>
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-[#f4f9fc]">
        {flash ? (
          <p className="mx-3 mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
            {flash}
          </p>
        ) : null}

        {loading || !dash ? (
          <p className="px-4 py-16 text-center text-sm text-slate-500">Načítám přehled zpráv…</p>
        ) : tab === "prehled" ? (
          <div className="mx-auto w-full max-w-3xl space-y-4 px-3 py-3 sm:px-4">
            <section className="rounded-2xl border border-[#cfe1f3] bg-white p-4 shadow-sm">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#2D7FF9]">Dashboard</p>
              <h2 className="mt-1 font-display text-xl font-semibold">Všechny zprávy na jednom místě</h2>
              <p className="mt-1 text-sm text-slate-600">
                Zkušební osu (květen–červenec) ukazujeme naplno — diagnózy, léky, laboratoř i otázky k lékaři.
                Vaše nahrávky se přidají do stejného přehledu.
              </p>
              <div className="mt-3 rounded-xl bg-[#eef5ff] px-3 py-2 text-sm">
                <p className="font-medium text-[#021d33]">Další krok</p>
                <p className="text-slate-600">
                  {dash.nextVisit.label}
                  {dash.nextVisit.specialty ? ` · ${dash.nextVisit.specialty}` : ""}
                </p>
              </div>
            </section>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {kpis.map((k) => (
                <div key={k.label} className="rounded-2xl border border-slate-200 bg-white p-3 text-center">
                  <k.icon className="mx-auto h-4 w-4 text-[#2D7FF9]" />
                  <p className="mt-1 text-2xl font-bold text-[#021d33]">{k.value}</p>
                  <p className="text-[11px] text-slate-500">{k.label}</p>
                </div>
              ))}
            </div>

            <section className="rounded-2xl border border-slate-200 bg-white p-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <ShieldAlert className="h-4 w-4 text-[#2D7FF9]" /> Diagnózy v ose
              </h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {dash.diagnoses.map((dx) => (
                  <span key={dx} className="rounded-full bg-[#eef5ff] px-3 py-1 text-xs font-medium text-[#021d33]">
                    {dx}
                  </span>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <Pill className="h-4 w-4 text-[#2D7FF9]" /> Lékový plán
              </h3>
              <ul className="mt-2 space-y-1.5 text-sm">
                {dash.medications.map((m) => (
                  <li key={m.name} className="flex justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2">
                    <span className="font-medium">{m.name}</span>
                    <span className="text-slate-500">
                      {[m.dose, m.schedule].filter(Boolean).join(" · ")}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <FlaskConical className="h-4 w-4 text-[#2D7FF9]" /> Laboratoř
              </h3>
              <ul className="mt-2 grid gap-2 sm:grid-cols-2">
                {dash.labValues.slice(0, 8).map((lab, i) => (
                  <li
                    key={`${lab.name}-${i}`}
                    className={`rounded-lg px-3 py-2 text-sm ${
                      lab.flag === "high" ? "bg-amber-50 text-amber-950" : "bg-slate-50"
                    }`}
                  >
                    <span className="font-medium">{lab.name}</span> {lab.value} {lab.unit}
                    {lab.ref ? <span className="block text-[11px] text-slate-500">ref. {lab.ref}</span> : null}
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-4">
              <h3 className="text-sm font-semibold">Časová osa · kontroly nahoře</h3>
              <ol className="mt-3 space-y-3">
                {dash.timeline.map((item) => (
                  <li key={item.id} className="relative border-l-2 border-[#2D7FF9]/30 pl-4">
                    <p className="text-[11px] text-slate-500">
                      {formatCs(item.date)}
                      {item.demo ? " · zkušební ukázka" : ""}
                    </p>
                    <p className="font-medium">{item.title}</p>
                    {item.highlight ? <p className="text-xs text-slate-600">{item.highlight}</p> : null}
                  </li>
                ))}
              </ol>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-4">
              <h3 className="text-sm font-semibold">Otázky na příští návštěvu</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                {dash.questions.slice(0, 6).map((q) => (
                  <li key={q}>{q}</li>
                ))}
              </ul>
            </section>
            <section className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
              <h3 className="text-sm font-semibold text-emerald-950">Doporučení ze zpráv</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-emerald-950/90">
                {Array.from(new Set(dash.documents.flatMap((d) => d.patientSummary.doporuceni)))
                  .slice(0, 8)
                  .map((item) => (
                    <li key={item}>{item}</li>
                  ))}
              </ul>
            </section>
            <p className="pb-4 text-[11px] text-slate-500">
              MeDipacient je vzdělávací přehled zpráv — nenahrazuje lékařskou péči ani diagnózu.
            </p>
          </div>
        ) : tab === "zpravy" ? (
          <div className="mx-auto w-full max-w-3xl space-y-3 px-3 py-3 sm:px-4">
            {selected ? (
              <article className="rounded-2xl border border-slate-200 bg-white p-4">
                <button type="button" className="text-sm text-[#2D7FF9]" onClick={() => setSelected(null)}>
                  ← Zpět na seznam
                </button>
                <p className="mt-2 text-[11px] uppercase tracking-wide text-slate-400">
                  {selected.demo ? "Zkušební zpráva" : "Vaše zpráva"} · {formatCs(selected.createdAt)}
                </p>
                <h2 className="mt-1 font-display text-xl font-semibold">{selected.title}</h2>
                <p className="text-sm text-slate-500">{selected.facility}</p>
                <pre className="mt-4 whitespace-pre-wrap font-sans text-sm leading-6 text-slate-800">
                  {selected.fullText}
                </pre>
              </article>
            ) : (
              dash.documents.map((doc) => (
                <button
                  key={doc.id}
                  type="button"
                  onClick={() => setSelected(doc)}
                  className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-left hover:border-[#2D7FF9]/40"
                >
                  <p className="text-[11px] text-slate-500">
                    {formatCs(doc.createdAt)} {doc.demo ? "· zkušební" : ""}
                  </p>
                  <p className="font-semibold">{doc.title}</p>
                  <p className="mt-1 text-sm text-slate-600">{doc.excerpt}</p>
                </button>
              ))
            )}
          </div>
        ) : tab === "nahrat" ? (
          <div className="mx-auto w-full max-w-3xl space-y-4 px-3 py-6 sm:px-4">
            <h2 className="font-display text-xl font-semibold">Nahrát zprávu</h2>
            <p className="text-sm text-slate-600">
              PDF nebo fotka (JPG/PNG). Funguje i z galerie telefonu. Bez dat se soubor odešle po připojení.
            </p>
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#2D7FF9]/40 bg-white px-4 py-10 text-center">
              <Upload className="h-8 w-8 text-[#2D7FF9]" />
              <span className="mt-2 text-sm font-medium">
                {uploading ? "Zpracovávám OCR…" : "Vybrat soubor nebo vyfotit zprávu"}
              </span>
              <input
                type="file"
                accept="application/pdf,image/jpeg,image/png"
                capture="environment"
                className="hidden"
                disabled={uploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void onUpload(file);
                }}
              />
            </label>
            {!session?.canUpload ? (
              <p className="text-sm text-slate-600">
                Zkušební osu už vidíte. Pro vlastní soubory{" "}
                <Link className="font-semibold text-[#2D7FF9] underline" href={session?.loginUrl || "/login"}>
                  se přihlaste
                </Link>
                .
              </p>
            ) : null}
          </div>
        ) : (
          <div className="mx-auto w-full max-w-3xl space-y-4 px-3 py-6 sm:px-4">
            <h2 className="font-display text-xl font-semibold">Účet</h2>
            <p className="text-sm text-slate-600">{session?.message}</p>
            {session?.authenticated ? (
              <p className="rounded-xl bg-white p-4 text-sm">
                {session.displayName || session.email}
                <span className="mt-1 block text-slate-500">{session.isVip ? "Premium" : "Základní přístup"}</span>
              </p>
            ) : (
              <Link
                href={session?.loginUrl || "/login?next=/app/pacient"}
                className="inline-flex rounded-full bg-[#2D7FF9] px-5 py-2.5 text-sm font-semibold text-white"
              >
                Přihlásit se
              </Link>
            )}
            <Link href="/predplatne#public" className="block text-sm font-medium text-[#2D7FF9]">
              Předplatné Veřejnost od 99 Kč →
            </Link>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="rounded-full border border-[#2D7FF9]/30 bg-white px-4 py-2 text-sm font-medium text-[#2D7FF9]"
                onClick={() => {
                  void (async () => {
                    const res = await fetch("/api/medipacient/export", { credentials: "same-origin" });
                    if (!res.ok) {
                      setFlash("Export se nepodařil.");
                      return;
                    }
                    const blob = new Blob([JSON.stringify(await res.json(), null, 2)], {
                      type: "application/json",
                    });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "medipacient-prehled.json";
                    a.click();
                    URL.revokeObjectURL(url);
                    setFlash("Přehled je stažený jako JSON.");
                  })();
                }}
              >
                Stáhnout přehled (JSON)
              </button>
              <button
                type="button"
                className="rounded-full border border-[#2D7FF9]/30 bg-white px-4 py-2 text-sm font-medium text-[#2D7FF9]"
                onClick={() => {
                  void (async () => {
                    const res = await fetch("/api/medipacient/reminders/notify", {
                      method: "POST",
                      credentials: "same-origin",
                    });
                    const json = (await res.json()) as { message?: string; error?: string };
                    setFlash(json.message || json.error || "Připomínka uložena.");
                  })();
                }}
              >
                Připomínka kontroly
              </button>
            </div>
            <Link href={MEDIPACIENT.marketingPath} className="block text-sm text-slate-500">
              Jak MeDipacient funguje
            </Link>
          </div>
        )}
      </main>

      <nav
        className="shrink-0 border-t border-[#cfe1f3] bg-white/95 backdrop-blur"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        aria-label={MEDIPACIENT.shortName}
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
                  active ? "text-[#2D7FF9]" : "text-slate-500"
                }`}
              >
                <Icon className={`h-5 w-5 ${active ? "text-[#2D7FF9]" : "text-slate-400"}`} />
                {label}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
