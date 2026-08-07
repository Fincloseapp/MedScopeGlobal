"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Copy,
  Download,
  History,
  Loader2,
  Mic,
  Pause,
  Share2,
  Square,
  Upload,
  AlertCircle,
  CheckCircle2,
  Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DOKUMENTACE_MAX_RECORD_MS,
  DOKUMENTACE_MAX_UPLOAD_BYTES,
  DOKUMENTACE_MODES,
  DOKUMENTACE_TEMPLATES,
  type DokumentaceMode,
  type DokumentaceTemplateId,
} from "@/lib/lekari/dokumentace/templates";

type WorkspaceState = "idle" | "recording" | "processing" | "done" | "error";

type NoteListItem = {
  id: string;
  title: string | null;
  note: string;
  transcript: string | null;
  template_id: string | null;
  mode: string | null;
  created_at: string;
  source: string | null;
};

function formatMs(ms: number): string {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function pickMimeType(): string {
  if (typeof MediaRecorder === "undefined") return "audio/webm";
  if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
    return "audio/webm;codecs=opus";
  }
  if (MediaRecorder.isTypeSupported("audio/webm")) return "audio/webm";
  if (MediaRecorder.isTypeSupported("audio/mp4")) return "audio/mp4";
  return "audio/webm";
}

function isMobileClient(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
}

type DokumentaceWorkspaceProps = {
  variant?: "default" | "app";
};

export function DokumentaceWorkspace({ variant = "default" }: DokumentaceWorkspaceProps) {
  const isApp = variant === "app";
  const [consent, setConsent] = useState(false);
  const [mode, setMode] = useState<DokumentaceMode>("consultation");
  const [templateId, setTemplateId] =
    useState<DokumentaceTemplateId>("ambulantni-zprava");
  const [specialty, setSpecialty] = useState("");
  const [state, setState] = useState<WorkspaceState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [gateHint, setGateHint] = useState<"login" | "subscribe" | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);
  const [transcript, setTranscript] = useState("");
  const [note, setNote] = useState("");
  const [provider, setProvider] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [savedInAccount, setSavedInAccount] = useState(false);
  const [history, setHistory] = useState<NoteListItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [copyFlash, setCopyFlash] = useState(false);
  const [showInstallTip, setShowInstallTip] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const startedAtRef = useRef<number>(0);
  const accumulatedRef = useRef(0);
  const timerRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    setShowInstallTip(isMobileClient());
  }, []);

  const stopTracks = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const clearTimer = useCallback(() => {
    if (timerRef.current != null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      clearTimer();
      stopTracks();
      mediaRecorderRef.current?.stop();
    };
  }, [clearTimer, stopTracks]);

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const res = await fetch("/api/lekari/dokumentace/notes?limit=40", {
        credentials: "same-origin",
      });
      if (!res.ok) {
        setHistory([]);
        return;
      }
      const json = (await res.json()) as { notes?: NoteListItem[] };
      setHistory(json.notes ?? []);
    } catch {
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  function applyGate(status: number, message: string) {
    setError(message);
    setState("error");
    if (status === 401) setGateHint("login");
    else if (status === 402 || status === 403) setGateHint("subscribe");
    else setGateHint(null);
  }

  async function processBlob(blob: Blob) {
    if (!consent) {
      setError("Nejprve potvrďte souhlas s nahráváním.");
      setState("error");
      return;
    }
    if (blob.size > DOKUMENTACE_MAX_UPLOAD_BYTES) {
      setError("Audio přesahuje limit 25 MB.");
      setState("error");
      return;
    }

    setState("processing");
    setError(null);
    setGateHint(null);
    setSavedInAccount(false);

    const form = new FormData();
    const ext = blob.type.includes("mp4") ? "m4a" : "webm";
    form.append("audio", blob, `recording.${ext}`);
    form.append("mode", mode);
    form.append("templateId", templateId);
    if (specialty.trim()) form.append("specialty", specialty.trim());
    form.append("source", isApp ? "pwa" : isMobileClient() ? "mobile" : "web");

    try {
      const res = await fetch("/api/lekari/dokumentace/process", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "x-dokumentace-source": isApp ? "pwa" : isMobileClient() ? "mobile" : "web",
        },
        body: form,
      });
      const json = (await res.json()) as {
        error?: string;
        transcript?: string;
        note?: string;
        provider?: string;
        remaining?: number;
        saved?: boolean;
      };
      if (!res.ok) {
        applyGate(res.status, json.error ?? "Zpracování selhalo.");
        return;
      }
      setTranscript(json.transcript ?? "");
      setNote(json.note ?? "");
      setProvider(json.provider ?? null);
      setRemaining(typeof json.remaining === "number" ? json.remaining : null);
      setSavedInAccount(Boolean(json.saved));
      setState("done");
      void loadHistory();
    } catch {
      setError("Síťová chyba při zpracování.");
      setState("error");
    }
  }

  async function startRecording() {
    if (!consent) {
      setError("Nejprve potvrďte souhlas s nahráváním.");
      setState("error");
      return;
    }
    setError(null);
    setGateHint(null);
    setTranscript("");
    setNote("");
    setProvider(null);
    setSavedInAccount(false);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mimeType = pickMimeType();
      const recorder = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        clearTimer();
        stopTracks();
        const blob = new Blob(chunksRef.current, { type: mimeType });
        chunksRef.current = [];
        mediaRecorderRef.current = null;
        if (blob.size === 0) {
          setError("Nahrávka je prázdná.");
          setState("error");
          return;
        }
        await processBlob(blob);
      };
      mediaRecorderRef.current = recorder;
      accumulatedRef.current = 0;
      startedAtRef.current = Date.now();
      setElapsedMs(0);
      setPaused(false);
      recorder.start(250);
      setState("recording");
      timerRef.current = window.setInterval(() => {
        if (pausedRef.current) return;
        const ms = accumulatedRef.current + (Date.now() - startedAtRef.current);
        setElapsedMs(ms);
        if (ms >= DOKUMENTACE_MAX_RECORD_MS) {
          stopRecording();
        }
      }, 200);
    } catch {
      setError("Nepodařilo se získat mikrofon. Povolte přístup v prohlížeči.");
      setState("error");
    }
  }

  function pauseRecording() {
    const rec = mediaRecorderRef.current;
    if (!rec || rec.state !== "recording") return;
    rec.pause();
    accumulatedRef.current += Date.now() - startedAtRef.current;
    setPaused(true);
  }

  function resumeRecording() {
    const rec = mediaRecorderRef.current;
    if (!rec || rec.state !== "paused") return;
    startedAtRef.current = Date.now();
    rec.resume();
    setPaused(false);
  }

  function stopRecording() {
    const rec = mediaRecorderRef.current;
    if (!rec) return;
    if (rec.state === "recording" || rec.state === "paused") {
      if (rec.state === "recording") {
        accumulatedRef.current += Date.now() - startedAtRef.current;
      }
      setElapsedMs(accumulatedRef.current);
      rec.stop();
    }
  }

  function onFileSelected(file: File | undefined) {
    if (!file) return;
    void processBlob(file);
  }

  async function copyText(text: string) {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopyFlash(true);
      window.setTimeout(() => setCopyFlash(false), 1600);
    } catch {
      setError("Kopírování do schránky selhalo.");
    }
  }

  async function copyNote() {
    await copyText(note);
  }

  async function copyLastFromHistory() {
    const last = history[0];
    if (last?.note) {
      await copyText(last.note);
      return;
    }
    if (note) {
      await copyText(note);
      return;
    }
    setError("Zatím není co kopírovat — vytvořte zápis.");
  }

  async function shareNote(text: string, title?: string | null) {
    if (!text) return;
    try {
      if (navigator.share) {
        await navigator.share({
          title: title || "MedScope Dokumentace",
          text,
        });
      } else {
        await copyText(text);
      }
    } catch {
      // user cancelled share
    }
  }

  function openHistoryNote(item: NoteListItem) {
    setTranscript(item.transcript ?? "");
    setNote(item.note);
    setSavedInAccount(true);
    setState("done");
    setHistoryOpen(false);
  }

  function scrollToHistory() {
    setHistoryOpen(true);
    historyRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function downloadNote() {
    if (!note) return;
    const blob = new Blob([note], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `medscope-dokumentace-${templateId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const recording = state === "recording";
  const processing = state === "processing";

  return (
    <div className={isApp ? "space-y-4 pb-2" : "space-y-6 pb-24 sm:pb-0"}>
      {!isApp && showInstallTip ? (
        <div className="flex gap-3 rounded-xl border border-[#cfe1f3] bg-[#eef6fb] px-4 py-3 text-sm text-[#021d33]">
          <Smartphone className="mt-0.5 h-5 w-5 shrink-0 text-[#005B96]" />
          <div>
            <p className="font-semibold">Přidat na plochu</p>
            <p className="mt-0.5 text-slate-600">
              iOS: Sdílet → Přidat na Domovskou obrazovku. Android: nabídka prohlížeče →
              Instalovat aplikaci. Nahrajte na mobilu → zápis se objeví i na PC.
            </p>
          </div>
        </div>
      ) : null}

      <div className="rounded-2xl border border-[#cfe1f3] bg-white p-5 sm:p-6 shadow-[0_12px_30px_-24px_rgba(0,91,150,0.55)]">
        <label className="flex items-start gap-3 text-sm text-[#021d33] cursor-pointer">
          <input
            type="checkbox"
            className="mt-1 h-5 w-5 accent-[#005B96]"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
          />
          <span>
            Informoval/a jsem pacienta o nahrávání (nebo jde o diktát bez pacienta)
          </span>
        </label>

        <p className="mt-3 text-xs leading-5 text-slate-500">
          Nahrajte na mobilu → zápis se objeví i na PC (historie v účtu).
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-[#005B96]">
              Režim
            </label>
            <select
              className="mt-1.5 h-12 w-full rounded-md border border-input bg-background px-3 text-base"
              value={mode}
              onChange={(e) => setMode(e.target.value as DokumentaceMode)}
              disabled={recording || processing}
            >
              {DOKUMENTACE_MODES.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-slate-500">
              {DOKUMENTACE_MODES.find((m) => m.id === mode)?.description}
            </p>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-[#005B96]">
              Šablona
            </label>
            <select
              className="mt-1.5 h-12 w-full rounded-md border border-input bg-background px-3 text-base"
              value={templateId}
              onChange={(e) =>
                setTemplateId(e.target.value as DokumentaceTemplateId)
              }
              disabled={recording || processing || mode === "verbatim"}
            >
              {DOKUMENTACE_TEMPLATES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-slate-500">
              {DOKUMENTACE_TEMPLATES.find((t) => t.id === templateId)?.description}
            </p>
          </div>
        </div>

        <div className="mt-4">
          <label className="text-xs font-semibold uppercase tracking-wide text-[#005B96]">
            Specializace (volitelné)
          </label>
          <input
            type="text"
            className="mt-1.5 h-12 w-full rounded-md border border-input bg-background px-3 text-base"
            placeholder="např. praktické lékařství, kardiologie"
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            disabled={recording || processing}
            maxLength={120}
          />
        </div>
      </div>

      <div className="border border-[#cfe1f3] bg-white/95 p-4 shadow-[0_12px_30px_-24px_rgba(0,91,150,0.55)] sm:rounded-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-full ${
                recording
                  ? paused
                    ? "bg-amber-100 text-amber-700"
                    : "bg-red-100 text-red-600 animate-pulse"
                  : "bg-[#e8f2f9] text-[#005B96]"
              }`}
            >
              <Mic className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#021d33]">
                {recording
                  ? paused
                    ? "Pozastaveno"
                    : "Nahrávání…"
                  : processing
                    ? "Zpracování…"
                    : "Připraveno k nahrání"}
              </p>
              <p className="font-mono text-lg text-[#005B96]">
                {formatMs(elapsedMs)}
                <span className="ml-2 text-xs text-slate-400">/ 60:00</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {!recording ? (
              <Button
                type="button"
                size="lg"
                className="h-12 min-w-[140px] rounded-full bg-[#005B96] px-6 text-base"
                onClick={() => void startRecording()}
                disabled={!consent || processing}
              >
                <Mic className="mr-2 h-5 w-5" />
                Nahrávat
              </Button>
            ) : (
              <>
                <Button
                  type="button"
                  size="lg"
                  variant="outline"
                  className="h-12 rounded-full px-5"
                  onClick={() => (paused ? resumeRecording() : pauseRecording())}
                >
                  <Pause className="mr-2 h-4 w-4" />
                  {paused ? "Pokračovat" : "Pauza"}
                </Button>
                <Button
                  type="button"
                  size="lg"
                  className="h-12 rounded-full bg-[#021d33] px-5"
                  onClick={stopRecording}
                >
                  <Square className="mr-2 h-4 w-4" />
                  Stop a zpracovat
                </Button>
              </>
            )}
            <Button
              type="button"
              size="lg"
              variant="outline"
              className="h-12 rounded-full px-5"
              disabled={!consent || recording || processing}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="mr-2 h-4 w-4" />
              Nahrát soubor
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*,.webm,.mp3,.m4a,.wav,.ogg"
              className="hidden"
              onChange={(e) => onFileSelected(e.target.files?.[0])}
            />
          </div>
        </div>
        {processing ? (
          <p className="mt-3 flex items-center gap-2 text-sm text-slate-600">
            <Loader2 className="h-4 w-4 animate-spin text-[#005B96]" />
            Přepisuji a sestavuji zápis… Audio se neukládá.
          </p>
        ) : null}
      </div>

      {error ? (
        <div className="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p>{error}</p>
            {gateHint === "login" ? (
              <p className="mt-2">
                <Link href={isApp ? "/login?next=/app/dokumentace" : "/login"} className="font-semibold text-[#005B96] underline">
                  Přihlásit se
                </Link>
              </p>
            ) : null}
            {gateHint === "subscribe" ? (
              <p className="mt-2">
                <Link
                  href="/predplatne#dokumentace"
                  className="font-semibold text-[#005B96] underline"
                >
                  Dokumentace od 390 Kč
                </Link>
                {" · "}
                <Link href="/predplatne#physician" className="underline">
                  Lékař 490 Kč
                </Link>
                {" · "}
                demo 3 zápisy/den · 14 dní trial
              </p>
            ) : null}
          </div>
        </div>
      ) : null}

      {(transcript || note || state === "done") && (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-[#cfe1f3] bg-white p-4 sm:p-5">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold text-[#021d33]">
                Přepis
              </h3>
              {provider ? (
                <span className="text-xs text-slate-400">{provider}</span>
              ) : null}
            </div>
            <textarea
              className="min-h-[180px] w-full rounded-md border border-input bg-slate-50 px-3 py-2 text-sm"
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
            />
          </div>
          <div className="rounded-2xl border border-[#cfe1f3] bg-white p-4 sm:p-5">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-display text-lg font-semibold text-[#021d33]">
                Klinický zápis
              </h3>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => void copyNote()}
                  disabled={!note}
                >
                  <Copy className="mr-1.5 h-3.5 w-3.5" />
                  Kopírovat
                </Button>
                {typeof navigator !== "undefined" && "share" in navigator ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => void shareNote(note)}
                    disabled={!note}
                  >
                    <Share2 className="mr-1.5 h-3.5 w-3.5" />
                    Sdílet
                  </Button>
                ) : null}
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={downloadNote}
                  disabled={!note}
                >
                  <Download className="mr-1.5 h-3.5 w-3.5" />
                  .txt
                </Button>
              </div>
            </div>
            {savedInAccount ? (
              <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Uloženo v účtu
              </p>
            ) : null}
            {copyFlash ? (
              <p className="mb-2 text-xs font-medium text-[#005B96]">Zkopírováno</p>
            ) : null}
            <textarea
              className="min-h-[220px] w-full rounded-md border border-input px-3 py-2 text-sm leading-6"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Zde se zobrazí návrh zápisu ke kontrole…"
            />
            {remaining != null ? (
              <p className="mt-2 text-xs text-slate-500">
                Zbývající zápisy dnes: {remaining}
              </p>
            ) : null}
          </div>
        </div>
      )}

{!isApp ? (
      <div
        ref={historyRef}
        id="moje-zapisy"
        className="rounded-2xl border border-[#cfe1f3] bg-white p-4 sm:p-5"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-display text-lg font-semibold text-[#021d33]">
            Moje zápisy
          </h3>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              setHistoryOpen((v) => !v);
              void loadHistory();
            }}
          >
            <History className="mr-1.5 h-3.5 w-3.5" />
            {historyOpen ? "Skrýt" : "Historie"}
          </Button>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          Sync mobil ↔ web pod stejným účtem.
        </p>
        {(historyOpen || history.length > 0) && (
          <div className="mt-4 space-y-2">
            {historyLoading ? (
              <p className="flex items-center gap-2 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Načítám…
              </p>
            ) : history.length === 0 ? (
              <p className="text-sm text-slate-500">Zatím žádné uložené zápisy.</p>
            ) : (
              history.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-wrap items-start justify-between gap-2 border-b border-[#eef4f9] py-3 last:border-0"
                >
                  <button
                    type="button"
                    className="min-w-0 flex-1 text-left"
                    onClick={() => openHistoryNote(item)}
                  >
                    <p className="truncate text-sm font-semibold text-[#021d33]">
                      {item.title || "Zápis"}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {new Date(item.created_at).toLocaleString("cs-CZ")}
                      {item.source ? ` · ${item.source}` : ""}
                      {item.template_id ? ` · ${item.template_id}` : ""}
                    </p>
                  </button>
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => void copyText(item.note)}
                    >
                      <Copy className="h-3.5 w-3.5" />
                      <span className="sr-only">Kopírovat</span>
                    </Button>
                    {typeof navigator !== "undefined" && "share" in navigator ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => void shareNote(item.note, item.title)}
                      >
                        <Share2 className="h-3.5 w-3.5" />
                        <span className="sr-only">Sdílet</span>
                      </Button>
                    ) : null}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
      ) : null}

      <div className="rounded-xl border border-[#d9e8f4] bg-[#f4f9fc] px-4 py-3 text-xs leading-5 text-slate-600">
        MedScope Dokumentace není zdravotnický prostředek. Výstup je návrh AI —
        konečnou odpovědnost za obsah nese lékař. Audio se po zpracování
        neukládá (ephemeral). Před nahráváním rozhovoru informujte pacienta.
      </div>

      {/* Mobile sticky bottom bar */}
      {!isApp ? (
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[#cfe1f3] bg-white/95 px-3 py-2 backdrop-blur sm:hidden">
        <div className="mx-auto flex max-w-lg items-center justify-around gap-1">
          <Button
            type="button"
            variant="ghost"
            className="flex h-auto flex-col gap-0.5 px-3 py-2 text-[11px]"
            disabled={!consent || processing || recording}
            onClick={() => void startRecording()}
          >
            <Mic className="h-5 w-5 text-[#005B96]" />
            Record
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="flex h-auto flex-col gap-0.5 px-3 py-2 text-[11px]"
            onClick={scrollToHistory}
          >
            <History className="h-5 w-5 text-[#005B96]" />
            Historie
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="flex h-auto flex-col gap-0.5 px-3 py-2 text-[11px]"
            onClick={() => void copyLastFromHistory()}
          >
            <Copy className="h-5 w-5 text-[#005B96]" />
            Kopírovat
          </Button>
        </div>
      </div>
      ) : null}
    </div>
  );
}
