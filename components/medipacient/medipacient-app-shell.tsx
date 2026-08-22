"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Clock3, FileHeart, LogOut, Trash2, Wifi, WifiOff } from "lucide-react";
import { MeDipacientMark } from "@/components/medipacient/medipacient-mark";
import { MeDipacientInstallButton } from "@/components/medipacient/medipacient-install-button";
import { MeDipacientGate } from "@/components/medipacient/medipacient-gate";
import { MeDipacientPaywall } from "@/components/medipacient/medipacient-paywall";
import { MeDipacientPatientSummary } from "@/components/medipacient/medipacient-patient-summary";
import { MeDipacientKontrolyList } from "@/components/medipacient/medipacient-kontroly-list";
import { MeDipacientOnboarding } from "@/components/medipacient/medipacient-onboarding";
import { TimelineView } from "@/components/medipacient/TimelineView";
import { LabGraphView } from "@/components/medipacient/LabGraphView";
import { NextVisitCard } from "@/components/medipacient/NextVisitCard";
import { PlanUpgradeCard } from "@/components/medipacient/PlanUpgradeCard";
import { UploadReportScreen } from "@/components/medipacient/UploadReportScreen";
import { useMeDipacientTextSize } from "@/components/medipacient/use-medipacient-text-size";
import { MEDIPACIENT } from "@/lib/medipacient/branding";
import { ensureMeDipacientServiceWorker } from "@/components/medipacient/use-medipacient-pwa";
import { useMeDipacientKontroly } from "@/components/medipacient/use-medipacient-reminders";
import { AI_FAILED_CS, DOCUMENT_NOT_FOUND_CS, DOCUMENT_RETRY_CS, EXTRACT_FAILED_CS, type PatientSummary } from "@/lib/medipacient/patient-summary";
import { filterPacientReports } from "@/lib/medipacient/search";
import type { ControlReminder } from "@/lib/medipacient/control-reminder";
import type { Recommendation, VisitPlanStored } from "@/lib/medipacient/medicalParserCZ";
import type { LabSeries, TimelineEvent } from "@/lib/medipacient/timelineEngine";
import { PLAN_COPY_CS, type MeDipacientPlan } from "@/lib/medipacient/entitlement";
import {
  isMpOnboardingDone,
  markMpOnboardingDone,
  MP_TEXT_SIZE_OPTIONS,
  type MpTextSize,
} from "@/lib/medipacient/prefs";
import { MP_ONBOARDING_HELP } from "@/lib/medipacient/onboarding";

type TabId = "zpravy" | "osa" | "ucet";

type AccessState = {
  authenticated: boolean;
  entitled: boolean;
  owner: boolean;
  isVip: boolean;
  plan?: MeDipacientPlan;
  limits?: {
    documents: number;
    timeline: boolean;
    graphs: boolean;
    reminders: boolean;
    advancedAi: boolean;
    trends: boolean;
    pdfExport: boolean;
  };
  email: string | null;
  displayName: string | null;
  message: string;
  loginUrl?: string;
  trialUrl?: string;
  ocrReady?: boolean;
};

type PacientDoc = {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  createdAt: string;
  patientSummary?: PatientSummary | null;
  extractStatus?: "pending" | "ready" | "failed";
  extractError?: string | null;
  controlReminder?: ControlReminder;
  labValues?: PatientSummary["lab_values"];
  recommendations?: Recommendation[];
  visitPlan?: VisitPlanStored | null;
  controlDate?: string | null;
};

function friendlyExtractError(error: string | null | undefined): string | null {
  if (!error) return null;
  if (error === DOCUMENT_NOT_FOUND_CS || /dokument nenalezen/i.test(error)) {
    return DOCUMENT_RETRY_CS;
  }
  if (/uložení seznamu selhalo|dokument se nepodařilo zapsat/i.test(error)) {
    return DOCUMENT_RETRY_CS;
  }
  return error;
}

function isRealDocumentId(id: string | undefined): boolean {
  return Boolean(id) && id !== "pending-upload" && id !== "upload-failed";
}

const TABS: { id: TabId; label: string; icon: typeof FileHeart }[] = [
  { id: "zpravy", label: "Zprávy", icon: FileHeart },
  { id: "osa", label: "Osa", icon: Clock3 },
  { id: "ucet", label: "Účet", icon: LogOut },
];

function formatWhen(iso: string) {
  try {
    return new Intl.DateTimeFormat("cs-CZ", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function TextSizeToggle({
  size,
  onChange,
  variant,
}: {
  size: MpTextSize;
  onChange: (next: MpTextSize) => void;
  variant: "header" | "account";
}) {
  const header = variant === "header";
  return (
    <div
      role="group"
      aria-label="Velikost písma"
      className={header ? "flex rounded-full bg-white/15 p-0.5" : "grid grid-cols-3 gap-2"}
    >
      {MP_TEXT_SIZE_OPTIONS.map((opt) => {
        const active = size === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            aria-pressed={active}
            className={
              header
                ? `min-h-9 min-w-9 rounded-full px-2 font-bold ${
                    active ? "bg-white text-[#021d33]" : "text-white/90"
                  } ${opt.id === "normal" ? "text-xs" : opt.id === "larger" ? "text-sm" : "text-base"}`
                : `min-h-14 rounded-full border-2 px-2 text-lg font-semibold ${
                    active
                      ? "border-[#2D7FF9] bg-[#2D7FF9] text-white"
                      : "border-slate-400 bg-white"
                  }`
            }
            aria-label={opt.label}
          >
            {header ? "A" : opt.label}
          </button>
        );
      })}
    </div>
  );
}

export function MeDipacientAppShell() {
  const [tab, setTab] = useState<TabId>("zpravy");
  const [autoInstall, setAutoInstall] = useState(false);
  const [online, setOnline] = useState(true);
  const [loading, setLoading] = useState(true);
  const [access, setAccess] = useState<AccessState | null>(null);
  const [docs, setDocs] = useState<PacientDoc[]>([]);
  const [docsError, setDocsError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [pendingOffline, setPendingOffline] = useState<string[]>([]);
  const [pendingDelete, setPendingDelete] = useState<PacientDoc | null>(null);
  const [exporting, setExporting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selected, setSelected] = useState<{
    doc: PacientDoc;
    url?: string;
    summary: PatientSummary | null;
    loading: boolean;
    extractError?: string | null;
  } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { upcoming, markDone, dismiss, isOnHome } = useMeDipacientKontroly(docs);
  const { size: textSize, setSize: setTextSize } = useMeDipacientTextSize();
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [labSeries, setLabSeries] = useState<Array<LabSeries & { predicted?: number | null }>>([]);
  const [nextVisit, setNextVisit] = useState<TimelineEvent | null>(null);

  const refreshAccess = useCallback(async () => {
    try {
      const res = await fetch("/api/medipacient/session", { credentials: "same-origin" });
      const data = (await res.json()) as AccessState;
      setAccess(data);
      return data;
    } catch {
      setAccess({
        authenticated: false,
        entitled: false,
        owner: false,
        isVip: false,
        email: null,
        displayName: null,
        message: "Nepodařilo se ověřit přístup. Zkontrolujte připojení.",
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshDocs = useCallback(async () => {
    try {
      const res = await fetch("/api/medipacient/documents", { credentials: "same-origin" });
      const body = (await res.json()) as { documents?: PacientDoc[]; error?: string };
      if (!res.ok) {
        setDocsError(body.error || "Seznam se nepodařilo načíst.");
        return [] as PacientDoc[];
      }
      const next = body.documents ?? [];
      setDocs(next);
      setDocsError(null);
      return next;
    } catch {
      setDocsError("Seznam se nepodařilo načíst.");
      return [] as PacientDoc[];
    }
  }, []);

  useEffect(() => {
    void ensureMeDipacientServiceWorker();
    const params = new URLSearchParams(window.location.search);
    if (params.get("install") === "1") setAutoInstall(true);
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

  useEffect(() => {
    void (async () => {
      const next = await refreshAccess();
      if (next?.entitled) await refreshDocs();
    })();
  }, [refreshAccess, refreshDocs]);

  useEffect(() => {
    if (!access?.entitled || !online) return;
    void fetch("/api/medipacient/reminders/notify", { method: "POST", credentials: "same-origin" });
  }, [access?.entitled, online, access?.plan]);

  useEffect(() => {
    if (!access?.authenticated || !access.entitled || !online) return;
    void (async () => {
      try {
        const visitRes = await fetch("/api/medipacient/nextVisit", { credentials: "same-origin" });
        if (visitRes.ok) {
          const body = (await visitRes.json()) as { nextVisit?: TimelineEvent | null };
          setNextVisit(body.nextVisit ?? null);
        }
      } catch {
        setNextVisit(null);
      }
      if (access.limits?.timeline || access.plan === "MEDIUM" || access.plan === "PREMIUM") {
        try {
          const [tl, labs] = await Promise.all([
            fetch("/api/medipacient/timeline", { credentials: "same-origin" }),
            fetch("/api/medipacient/labValues", { credentials: "same-origin" }),
          ]);
          if (tl.ok) {
            const body = (await tl.json()) as { events?: TimelineEvent[]; nextVisit?: TimelineEvent | null };
            setTimelineEvents(body.events ?? []);
            if (body.nextVisit) setNextVisit(body.nextVisit);
          }
          if (labs.ok) {
            const body = (await labs.json()) as { series?: Array<LabSeries & { predicted?: number | null }> };
            setLabSeries(body.series ?? []);
          }
        } catch {
          setTimelineEvents([]);
          setLabSeries([]);
        }
      }
    })();
  }, [access?.authenticated, access?.entitled, online, docs.length, access?.limits?.timeline, access?.plan]);

  async function uploadFiles(files: FileList | null) {
    if (!files?.length) return;
    if (!online) {
      setPendingOffline((prev) => [...prev, ...Array.from(files).map((f) => f.name)].slice(-12));
      return;
    }
    setUploading(true);
    setDocsError(null);
    let lastDoc: PacientDoc | null = null;
    try {
      for (const file of Array.from(files)) {
        setSelected({
          doc: {
            id: "pending-upload",
            name: file.name,
            mimeType: file.type,
            size: file.size,
            createdAt: new Date().toISOString(),
            extractStatus: "pending",
          },
          summary: null,
          loading: true,
        });
        const form = new FormData();
        form.set("file", file);
        const res = await fetch("/api/medipacient/uploadReport", {
          method: "POST",
          credentials: "same-origin",
          body: form,
        });
        const body = (await res.json()) as { error?: string; document?: PacientDoc };
        if (!res.ok) {
          setDocsError(body.error || `Nahrání ${file.name} selhalo.`);
          setSelected({
            doc: {
              id: "upload-failed",
              name: file.name,
              mimeType: file.type,
              size: file.size,
              createdAt: new Date().toISOString(),
              extractStatus: "failed",
            },
            summary: null,
            loading: false,
            extractError: body.error || EXTRACT_FAILED_CS,
          });
          break;
        }
        lastDoc = body.document ?? lastDoc;
      }
      const listed = await refreshDocs();
      if (lastDoc) {
        const fromList = listed.find((d) => d.id === lastDoc?.id);
        await openDoc(lastDoc.id, fromList ?? lastDoc);
      }
    } catch {
      setDocsError("Nahrání selhalo. Zkuste to znovu.");
      setSelected({
        doc: { id: "upload-failed", name: "Soubor", mimeType: "", size: 0, createdAt: new Date().toISOString() },
        summary: null,
        loading: false,
        extractError: EXTRACT_FAILED_CS,
      });
      await refreshDocs();
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function fetchDocument(id: string) {
    const res = await fetch(`/api/medipacient/documents/${encodeURIComponent(id)}`, { credentials: "same-origin" });
    let body: {
      url?: string | null;
      error?: string;
      document?: PacientDoc;
      patientSummary?: PatientSummary | null;
    } = {};
    try {
      body = (await res.json()) as typeof body;
    } catch {
      body = { error: AI_FAILED_CS };
    }
    return { res, body };
  }

  async function openDoc(id: string, seed?: PacientDoc | null) {
    const current = seed ?? docs.find((d) => d.id === id);
    const alreadyFailed = current?.extractStatus === "failed" && !current.patientSummary;
    setSelected({
      doc: current ?? { id, name: "Dokument", mimeType: "", size: 0, createdAt: "" },
      summary: current?.patientSummary ?? null,
      loading: !current?.patientSummary && !alreadyFailed,
      extractError: alreadyFailed ? current?.extractError || EXTRACT_FAILED_CS : null,
    });
    let res: Response;
    let body: {
      url?: string | null;
      error?: string;
      document?: PacientDoc;
      patientSummary?: PatientSummary | null;
    };
    try {
      ({ res, body } = await fetchDocument(id));
      if (!res.ok && res.status === 404) {
        await new Promise((resolve) => window.setTimeout(resolve, 500));
        ({ res, body } = await fetchDocument(id));
      }
    } catch {
      if (current && isRealDocumentId(current.id)) {
        const failed = current.extractStatus === "failed" && !current.patientSummary;
        setSelected({
          doc: current,
          summary: current.patientSummary ?? null,
          loading: false,
          extractError: failed ? current.extractError || EXTRACT_FAILED_CS : EXTRACT_FAILED_CS,
        });
        return;
      }
      setSelected({
        doc: current ?? { id, name: "Dokument", mimeType: "", size: 0, createdAt: "" },
        summary: null,
        loading: false,
        extractError: EXTRACT_FAILED_CS,
      });
      return;
    }
    if (!res.ok) {
      if (current && isRealDocumentId(current.id)) {
        const failed = current.extractStatus === "failed" && !current.patientSummary;
        setSelected({
          doc: current,
          summary: current.patientSummary ?? null,
          loading: false,
          extractError: failed
            ? current.extractError || EXTRACT_FAILED_CS
            : friendlyExtractError(body.error) || EXTRACT_FAILED_CS,
        });
        return;
      }
      setDocsError(friendlyExtractError(body.error) || "Dokument nejde otevřít.");
      setSelected({
        doc: current ?? { id, name: "Dokument", mimeType: "", size: 0, createdAt: "" },
        summary: null,
        loading: false,
        extractError: friendlyExtractError(body.error) || AI_FAILED_CS,
      });
      return;
    }
    const next = body.document ?? current ?? { id, name: "Dokument", mimeType: "", size: 0, createdAt: "" };
    const summary = body.patientSummary ?? next.patientSummary ?? null;
    const failed = next.extractStatus === "failed" && !summary;
    setSelected({
      doc: next,
      url: body.url || undefined,
      summary,
      loading: false,
      extractError: failed ? next.extractError || EXTRACT_FAILED_CS : null,
    });
  }

  async function reprocessSelected() {
    if (!selected || !isRealDocumentId(selected.doc.id)) return;
    setSelected({ ...selected, loading: true, extractError: null });
    const res = await fetch(`/api/medipacient/documents/${encodeURIComponent(selected.doc.id)}/reprocess`, {
      method: "POST",
      credentials: "same-origin",
    });
    const body = (await res.json()) as { error?: string; document?: PacientDoc; patientSummary?: PatientSummary | null };
    if (!res.ok) {
      setDocsError(body.error || AI_FAILED_CS);
      setSelected({ ...selected, loading: false, extractError: body.error || AI_FAILED_CS });
      return;
    }
    const next = body.document ?? selected.doc;
    const summary = body.patientSummary ?? next.patientSummary ?? null;
    const failed = next.extractStatus === "failed" && !summary;
    setSelected({
      ...selected,
      doc: next,
      summary,
      loading: false,
      extractError: failed ? next.extractError || EXTRACT_FAILED_CS : null,
    });
    await refreshDocs();
  }

  async function removeDoc(id: string) {
    const res = await fetch(`/api/medipacient/documents/${encodeURIComponent(id)}`, {
      method: "DELETE",
      credentials: "same-origin",
    });
    if (res.ok) {
      setPendingDelete(null);
      if (selected?.doc.id === id) setSelected(null);
      await refreshDocs();
    } else {
      setDocsError("Smazání se nepodařilo.");
    }
  }

  async function exportMyData() {
    setExporting(true);
    try {
      const res = await fetch("/api/medipacient/export", { credentials: "same-origin" });
      const body = await res.json();
      if (!res.ok) {
        setDocsError((body as { error?: string }).error || "Export se nepodařil.");
        return;
      }
      downloadJson(`medipacient-udaje-${new Date().toISOString().slice(0, 10)}.json`, body);
    } catch {
      setDocsError("Export se nepodařil.");
    } finally {
      setExporting(false);
    }
  }

  async function logout() {
    await fetch("/api/medipacient/session", { method: "DELETE", credentials: "same-origin" });
    setAccess({
      authenticated: false,
      entitled: false,
      owner: false,
      isVip: false,
      email: null,
      displayName: null,
      message: "Byli jste odhlášeni.",
      loginUrl: "/login?next=/app/pacient",
    });
    setDocs([]);
  }

  const showWorkspace = Boolean(access?.authenticated && access.entitled);
  const filteredDocs = filterPacientReports(docs, searchQuery);
  const searchActive = Boolean(searchQuery.trim());

  useEffect(() => {
    if (!showWorkspace) return;
    if (!isMpOnboardingDone()) setOnboardingOpen(true);
  }, [showWorkspace]);

  function dismissOnboarding() {
    markMpOnboardingDone();
    setOnboardingOpen(false);
  }

  return (
    <div
      className="mp-pacient-shell flex h-[100dvh] flex-col overflow-hidden bg-[#F5F7FA] text-[#021d33]"
      data-mp-text-size={textSize}
      style={{
        paddingTop: "env(safe-area-inset-top)",
        paddingLeft: "env(safe-area-inset-left)",
        paddingRight: "env(safe-area-inset-right)",
      }}
    >
      <header className="shrink-0 border-b border-white/10 bg-[#021d33] px-3 py-2.5 text-white sm:px-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2.5">
            <MeDipacientMark size="sm" className="shrink-0 rounded-[22%] ring-1 ring-white/25" />
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold uppercase tracking-[0.18em] text-sky-200/90">
                {MEDIPACIENT.provider}
              </p>
              <h1 className="truncate text-lg font-semibold leading-tight">{MEDIPACIENT.shortName}</h1>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                online ? "bg-emerald-400/20 text-emerald-50" : "bg-amber-400/20 text-amber-50"
              }`}
              aria-label={online ? "Online" : "Offline"}
            >
              {online ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">{online ? "Online" : "Offline"}</span>
            </span>
            {showWorkspace ? <TextSizeToggle size={textSize} onChange={setTextSize} variant="header" /> : null}
            <MeDipacientInstallButton autoOpen={autoInstall} />
          </div>
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {loading ? (
          <p className="px-4 py-16 text-center text-lg text-slate-700">Načítám MeDipacient…</p>
        ) : !access?.authenticated ? (
          <MeDipacientGate message={access?.message || "Přihlaste se účtem MedScopeGlobal."} loginUrl={access?.loginUrl} />
        ) : !access.entitled ? (
          <MeDipacientPaywall email={access.email} trialUrl={access.trialUrl} />
        ) : tab === "ucet" ? (
          <div className="mx-auto max-w-lg space-y-5 px-4 py-8">
            <h2 className="font-display text-3xl font-semibold">Účet</h2>
            <p className="text-lg text-slate-800">{access.displayName || access.email || "Přihlášený účet"}</p>
            <p className="text-base leading-7 text-slate-700">
              {access.owner
                ? "Vlastnický trial účet — přístup bez paywallu (Premium)."
                : access.plan === "MEDIUM"
                  ? "Tarif Medium — neomezené zprávy, osa, grafy a připomínky."
                  : access.plan === "PREMIUM"
                    ? "Tarif Premium — pokročilá AI, trendy a PDF."
                    : access.isVip
                      ? "Aktivní trial nebo předplatné MedScopeGlobal."
                      : `Tarif Zdarma: až ${access.limits?.documents ?? 20} zpráv. Medium odemkne osu, grafy a připomínky.`}
            </p>
            <p className="text-lg font-semibold text-[#021d33]">
              {PLAN_COPY_CS[access.plan || "FREE"].name}: {PLAN_COPY_CS[access.plan || "FREE"].summary}
            </p>
            <p className="text-sm text-slate-600">Verze aplikace {MEDIPACIENT.buildStamp}</p>
            {access.plan === "FREE" ? <PlanUpgradeCard /> : null}
            <div>
              <h3 className="text-xl font-semibold">Velikost písma</h3>
              <p className="mt-1 text-base leading-6 text-slate-700">Platí v celé aplikaci MeDipacient na tomto zařízení.</p>
              <div className="mt-3">
                <TextSizeToggle size={textSize} onChange={setTextSize} variant="account" />
              </div>
            </div>
            <button
              type="button"
              onClick={() => void exportMyData()}
              disabled={exporting}
              className="min-h-14 w-full rounded-full border-2 border-slate-400 bg-white px-4 text-lg font-semibold disabled:opacity-60"
            >
              {exporting ? "Připravuji JSON…" : "Stáhnout moje údaje (JSON)"}
            </button>
            <p className="text-base leading-6 text-slate-700">
              Soubor obsahuje seznam zpráv, metadata a srozumitelné překlady (patientSummary). Originální PDF/fotky v něm nejsou.
            </p>
            <div className="flex flex-col gap-2">
              <MeDipacientInstallButton variant="hero" />
              <button
                type="button"
                onClick={() => setOnboardingOpen(true)}
                className="flex min-h-14 items-center justify-center rounded-full border-2 border-slate-300 bg-white px-4 text-center text-lg font-semibold"
              >
                {MP_ONBOARDING_HELP}
              </button>
              <Link
                href={MEDIPACIENT.routes.marketing}
                className="flex min-h-12 items-center justify-center rounded-full px-4 text-center text-lg text-slate-700"
              >
                MeDipacient na webu
              </Link>
              <button
                type="button"
                onClick={() => void logout()}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-4 text-lg text-rose-800"
              >
                <LogOut className="h-5 w-5" />
                Odhlásit
              </button>
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-lg px-4 py-6 pb-4">
            <h1 className="font-display text-3xl font-semibold leading-tight text-[#021d33]">
              {tab === "osa" ? "Časová osa" : "Vaše zprávy"}
            </h1>
            <p className="mt-2 text-lg leading-7 text-slate-800">
              {tab === "osa" ? "Zprávy od nejnovější." : "Nahrajte PDF nebo fotku. Soubory patří jen k tomuto účtu."}
            </p>
            {tab === "zpravy" ? (
              <button
                type="button"
                onClick={() => setOnboardingOpen(true)}
                className="mt-2 text-left text-lg font-semibold text-[#2D7FF9] underline-offset-4 hover:underline"
              >
                {MP_ONBOARDING_HELP}
              </button>
            ) : null}

            {!online ? (
              <p className="mt-3 rounded-xl border-2 border-amber-400 bg-amber-50 px-3 py-3 text-base font-medium text-amber-950">
                Jste offline. Soubor se nahraje po připojení, pokud okno necháte otevřené.
              </p>
            ) : null}

            {pendingOffline.length ? (
              <ul className="mt-3 space-y-1 text-base text-amber-900">
                {pendingOffline.map((name) => (
                  <li key={name}>Ve frontě: {name}</li>
                ))}
              </ul>
            ) : null}

            {docsError ? <p className="mt-3 text-lg leading-7 text-rose-800">{docsError}</p> : null}

            {tab === "zpravy" && access.ocrReady === false ? (
              <p className="mt-3 rounded-xl border-2 border-amber-400 bg-amber-50 px-3 py-3 text-base leading-6 text-amber-950">
                Čtení naskenovaných zpráv teď není dostupné. Soubor po nahrání zůstane uložený — zkuste Znovu zpracovat.
              </p>
            ) : null}

            {tab === "zpravy" ? (
              <>
                <NextVisitCard visit={nextVisit} onOpen={(id) => void openDoc(id)} showCalendar={Boolean(access.limits?.reminders)} />
                <MeDipacientKontrolyList
                  items={access.limits?.reminders === false ? [] : upcoming}
                  onOpen={(id) => void openDoc(id)}
                  onDone={(id) => void markDone(id)}
                  onDismiss={(id) => void dismiss(id)}
                />
                {access.plan === "FREE" ? <PlanUpgradeCard feature="reminders" className="mt-4" /> : null}
              </>
            ) : upcoming.length && access.limits?.reminders !== false ? (
              <MeDipacientKontrolyList
                items={upcoming}
                onOpen={(id) => void openDoc(id)}
                onDone={(id) => void markDone(id)}
                onDismiss={(id) => void dismiss(id)}
              />
            ) : null}

            {tab === "zpravy" && docs.length > 0 ? (
              <div className="mt-5">
                <label htmlFor="medipacient-search" className="sr-only">
                  Hledat zprávu
                </label>
                <input
                  id="medipacient-search"
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Hledat zprávu…"
                  autoComplete="off"
                  enterKeyHint="search"
                  className="min-h-16 w-full rounded-2xl border-2 border-slate-400 bg-white px-4 text-xl leading-7 text-[#021d33] placeholder:text-slate-500"
                />
              </div>
            ) : null}

            {docs.length === 0 && !docsError ? (
              <p className="mt-8 rounded-2xl border-2 border-dashed border-slate-400 bg-white px-4 py-8 text-center text-lg leading-7 text-slate-800">
                Zatím žádné zprávy. Stiskněte <strong>Nahrát zprávu</strong> dole.
              </p>
            ) : tab === "osa" ? (
              access.limits?.timeline === false || access.plan === "FREE" ? (
                <PlanUpgradeCard feature="timeline" className="mt-6" />
              ) : (
                <>
                  <NextVisitCard visit={nextVisit} onOpen={(id) => void openDoc(id)} />
                  <LabGraphView series={labSeries} showPrediction={Boolean(access.limits?.trends)} />
                  <TimelineView events={timelineEvents} onOpen={(id) => void openDoc(id)} />
                </>
              )
            ) : searchActive && filteredDocs.length === 0 ? (
              <p className="mt-6 rounded-2xl border-2 border-slate-300 bg-white px-4 py-6 text-center text-lg leading-7 text-slate-800">
                Žádná zpráva neodpovídá „{searchQuery.trim()}“.
              </p>
            ) : (
              <ul className="mt-6 space-y-3">
                {filteredDocs.map((doc) => (
                  <li key={doc.id} className="flex items-center gap-2 rounded-2xl border-2 border-slate-300 bg-white px-3 py-3">
                    <button type="button" onClick={() => void openDoc(doc.id)} className="min-w-0 flex-1 text-left">
                      <p className="truncate text-lg font-semibold">{doc.name}</p>
                      <p className="text-base leading-6 text-slate-700">
                        {formatWhen(doc.createdAt)}
                        {doc.patientSummary?.obor_lekare ? ` · ${doc.patientSummary.obor_lekare}` : ""}
                        {doc.extractStatus === "failed" ? " · nejde přečíst" : ""}
                        {doc.extractStatus === "pending" && !doc.patientSummary ? " · čteme…" : ""}
                      </p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPendingDelete(doc)}
                      className="rounded-full p-3 text-slate-600 hover:bg-rose-50 hover:text-rose-800"
                      aria-label={`Smazat ${doc.name}`}
                    >
                      <Trash2 className="h-6 w-6" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </main>

      {showWorkspace ? (
        <>
          <UploadReportScreen
            inputRef={inputRef}
            uploading={uploading}
            online={online}
            onPick={(files) => void uploadFiles(files)}
          />
          <nav
            className="shrink-0 border-t border-slate-200 bg-white"
            style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
            aria-label={MEDIPACIENT.fullName}
          >
            <div className="mx-auto grid max-w-3xl grid-cols-3">
              {TABS.map(({ id, label, icon: Icon }) => {
                const active = tab === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setTab(id)}
                    className={`flex min-h-14 flex-col items-center justify-center gap-0.5 px-1 text-sm font-semibold ${
                      active ? "text-[#2D7FF9]" : "text-slate-700"
                    }`}
                    aria-current={active ? "page" : undefined}
                  >
                    <Icon className={`h-6 w-6 ${active ? "text-[#2D7FF9]" : "text-slate-500"}`} />
                    {label}
                  </button>
                );
              })}
            </div>
          </nav>
        </>
      ) : null}

      {pendingDelete ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center" role="dialog" aria-modal="true" aria-label="Smazat zprávu">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 text-[#021d33]">
            <p className="text-2xl font-semibold">Smazat zprávu?</p>
            <p className="mt-2 text-lg leading-7">
              Opravdu smazat „{pendingDelete.name}“? Tuto zprávu už nepůjde obnovit.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPendingDelete(null)}
                className="min-h-14 rounded-full border-2 border-slate-400 bg-white text-lg font-semibold"
              >
                Zpět
              </button>
              <button
                type="button"
                onClick={() => void removeDoc(pendingDelete.id)}
                className="min-h-14 rounded-full bg-rose-700 text-lg font-semibold text-white"
              >
                Smazat
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {selected ? (
        <MeDipacientPatientSummary
          name={selected.doc.name}
          summary={selected.summary}
          originalUrl={selected.url}
          loading={selected.loading}
          extractError={selected.extractError}
          reminderSaved={Boolean(
            selected.summary?.termin_kontroly.vypoctene_datum &&
              isOnHome(selected.doc.id, selected.summary.termin_kontroly.vypoctene_datum),
          )}
          recommendations={selected.doc.recommendations || selected.summary?.recommendations || []}
          canExportPdf={access?.limits?.pdfExport !== false && access?.plan !== "FREE"}
          onClose={() => {
            setSelected(null);
            void refreshDocs();
          }}
          onReprocess={isRealDocumentId(selected.doc.id) ? () => void reprocessSelected() : undefined}
        />
      ) : null}

      <MeDipacientOnboarding open={onboardingOpen} onDismiss={dismissOnboarding} />
    </div>
  );
}
