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
  DOKUMENTACE_AUDIO_BITS_PER_SECOND,
  DOKUMENTACE_MAX_RECORD_MS,
  DOKUMENTACE_SEGMENT_MS,
  DOKUMENTACE_SOFT_UPLOAD_BYTES,
  DOKUMENTACE_MODES,
  DOKUMENTACE_TEMPLATES,
  type DokumentaceMode,
  type DokumentaceTemplateId,
} from "@/lib/lekari/dokumentace/templates";
import {
  MEDIKTOR_FILE_ACCEPT,
  prepareUploadBlobs,
  resolveAudioMeta,
} from "@/components/lekari/mediktor-audio";

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

const CONSENT_KEY = "mediktor_consent_v1";

function micErrorMessage(err: unknown): string {
  const name = err && typeof err === "object" && "name" in err ? String((err as { name: string }).name) : "";
  if (name === "NotAllowedError" || name === "PermissionDeniedError") {
    return "Mikrofon je zablokovaný. V telefonu: Nastavení → MeDiktor / Safari / Chrome → Mikrofon → Povolit, pak znovu klepněte na „Povolit mikrofon“.";
  }
  if (name === "NotFoundError") {
    return "Mikrofon nebyl nalezen. Zkontrolujte, že zařízení má mikrofon a není používán jinou aplikací.";
  }
  return "Nepodařilo se získat mikrofon. Povolte přístup a zkuste znovu.";
}

async function ensureMicPermission(): Promise<MediaStream> {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw Object.assign(new Error("getUserMedia unavailable"), { name: "NotSupportedError" });
  }
  return navigator.mediaDevices.getUserMedia({
    audio: {
      channelCount: 1,
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    },
  });
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
  const [micReady, setMicReady] = useState(false);
  const [micBusy, setMicBusy] = useState(false);
  const [segmentCount, setSegmentCount] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const segmentBlobsRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const startedAtRef = useRef<number>(0);
  const accumulatedRef = useRef(0);
  const timerRef = useRef<number | null>(null);
  const rotatingRef = useRef(false);
  const mimeTypeRef = useRef("audio/webm");
  const finalizingRef = useRef(false);
  const lastRotateRef = useRef(0);
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

  async function readApiJson(res: Response): Promise<{
    error?: string;
    transcript?: string;
    note?: string;
    provider?: string;
    remaining?: number;
    saved?: boolean;
    code?: string;
  }> {
    const raw = await res.text();
    if (!raw) {
      return {
        error:
          res.status === 413
            ? "Nahrávka je příliš velká pro odeslání. Zkuste kratší úsek — aplikace teď dělí nahrávku po 2 minutách."
            : `Server neodpověděl (HTTP ${res.status}). Zkuste znovu.`,
      };
    }
    try {
      return JSON.parse(raw) as {
        error?: string;
        transcript?: string;
        note?: string;
        provider?: string;
        remaining?: number;
        saved?: boolean;
        code?: string;
      };
    } catch {
      if (res.status === 413 || /request entity too large|payload/i.test(raw)) {
        return {
          error:
            "Nahrávka je příliš velká pro odeslání. Zkuste kratší úsek — aplikace teď dělí nahrávku po 2 minutách.",
          code: "SEGMENT_TOO_LARGE",
        };
      }
      if (res.status === 401) {
        return { error: "Pro zpracování se musíte přihlásit." };
      }
      if (res.status >= 500) {
        return {
          error: `Zpracování na serveru selhalo (HTTP ${res.status}). Zkuste znovu za chvíli.`,
        };
      }
      return {
        error: `Neočekávaná odpověď serveru (HTTP ${res.status}). Zkuste znovu.`,
      };
    }
  }

  async function processBlobs(blobs: Blob[]) {
    if (!consent) {
      setError("Nejprve potvrďte souhlas s nahráváním.");
      setState("error");
      return;
    }
    const usable = blobs.filter((b) => b.size > 0);
    if (usable.length === 0) {
      setError(
        "Nahrávka je prázdná — mikrofon nic nezachytil. Povolte mikrofon a zkuste znovu."
      );
      setState("error");
      return;
    }

    setState("processing");
    setError(null);
    setGateHint(null);
    setSavedInAccount(false);

    const source = isApp ? "pwa" : isMobileClient() ? "mobile" : "web";
    const parts: string[] = [];
    const providers: string[] = [];

    try {
      for (let i = 0; i < usable.length; i++) {
        const blob = usable[i];
        if (blob.size > DOKUMENTACE_SOFT_UPLOAD_BYTES) {
          setError(
            `Segment ${i + 1} je příliš velký (${Math.max(1, Math.round(blob.size / (1024 * 1024)))} MB). Nahrajte znovu — nahrávka se teď automaticky dělí po 2 minutách.`
          );
          setState("error");
          return;
        }

        const form = new FormData();
        const meta = resolveAudioMeta(
          blob instanceof File
            ? blob
            : Object.assign(blob, { name: `chunk-${i}.wav` }),
          i
        );
        const part =
          blob instanceof File
            ? blob
            : new File([blob], meta.filename, { type: meta.mime || blob.type || "audio/wav" });
        form.append("audio", part, meta.filename);

        const res = await fetch("/api/lekari/dokumentace/stt-chunk", {
          method: "POST",
          credentials: "same-origin",
          headers: { "x-dokumentace-source": source },
          body: form,
        });
        const json = await readApiJson(res);
        if (!res.ok) {
          applyGate(res.status, json.error ?? `Přepis segmentu ${i + 1} selhal.`);
          return;
        }
        const piece = (json.transcript ?? "").trim();
        if (!piece) {
          setError(
            `Segment ${i + 1} se nepřepsal (prázdný výsledek). Zkontrolujte mikrofon a zkuste znovu.`
          );
          setState("error");
          return;
        }
        parts.push(piece);
        if (json.provider) providers.push(json.provider);
      }

      const transcript = parts.join("\n\n").trim();
      const structRes = await fetch("/api/lekari/dokumentace/structure", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          "x-dokumentace-source": source,
        },
        body: JSON.stringify({
          transcript,
          mode,
          templateId,
          specialty: specialty.trim() || undefined,
          source,
        }),
      });
      const structJson = await readApiJson(structRes);
      if (!structRes.ok) {
        applyGate(structRes.status, structJson.error ?? "Sestavení zápisu selhalo.");
        return;
      }
      if (!(structJson.note ?? "").trim()) {
        setError("Zápis se nepodařilo sestavit. Zkuste nahrávku znovu.");
        setState("error");
        return;
      }

      setTranscript(transcript);
      setNote(structJson.note ?? "");
      setProvider(providers.join("+") || null);
      setRemaining(
        typeof structJson.remaining === "number" ? structJson.remaining : null
      );
      setSavedInAccount(Boolean(structJson.saved));
      setState("done");
      void loadHistory();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (/failed to fetch|networkerror|load failed/i.test(msg)) {
        setError(
          "Odeslání nahrávky selhalo. Často jde o příliš velký soubor, ne o výpadek sítě — zkuste kratší nahrávku (dělení po 2 min je zapnuté)."
        );
      } else {
        setError(`Zpracování selhalo: ${msg.slice(0, 180)}`);
      }
      setState("error");
    }
  }

  async function enableMicrophone() {
    setMicBusy(true);
    setError(null);
    try {
      const stream = await ensureMicPermission();
      stream.getTracks().forEach((tr) => tr.stop());
      setMicReady(true);
      if (!consent) setConsent(true);
    } catch (err) {
      setMicReady(false);
      setError(micErrorMessage(err));
      setState("error");
    } finally {
      setMicBusy(false);
    }
  }

  async function startRecording() {
    if (!consent) {
      setError("Nejprve potvrďte souhlas s nahráváním (nebo povolte mikrofon).");
      setState("error");
      return;
    }
    setError(null);
    setGateHint(null);
    setTranscript("");
    setNote("");
    setProvider(null);
    setSavedInAccount(false);
    segmentBlobsRef.current = [];
    setSegmentCount(0);
    finalizingRef.current = false;
    rotatingRef.current = false;
    lastRotateRef.current = 0;

    try {
      const stream = streamRef.current?.active
        ? streamRef.current
        : await ensureMicPermission();
      streamRef.current = stream;
      setMicReady(true);
      const mimeType = pickMimeType();
      mimeTypeRef.current = mimeType;

      const attachRecorder = () => {
        let recorder: MediaRecorder;
        try {
          recorder = new MediaRecorder(stream, {
            mimeType,
            audioBitsPerSecond: DOKUMENTACE_AUDIO_BITS_PER_SECOND,
          });
        } catch {
          recorder = new MediaRecorder(stream, { mimeType });
        }
        chunksRef.current = [];
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunksRef.current.push(e.data);
        };
        recorder.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: mimeTypeRef.current });
          chunksRef.current = [];
          if (blob.size > 0) {
            segmentBlobsRef.current.push(blob);
            setSegmentCount(segmentBlobsRef.current.length);
          }
          if (rotatingRef.current) {
            rotatingRef.current = false;
            if (!finalizingRef.current && streamRef.current?.active) {
              attachRecorder();
              mediaRecorderRef.current?.start(1000);
            }
            return;
          }
          if (finalizingRef.current) {
            clearTimer();
            stopTracks();
            mediaRecorderRef.current = null;
            const blobs = [...segmentBlobsRef.current];
            segmentBlobsRef.current = [];
            void processBlobs(blobs);
          }
        };
        mediaRecorderRef.current = recorder;
      };

      attachRecorder();
      accumulatedRef.current = 0;
      startedAtRef.current = Date.now();
      setElapsedMs(0);
      setPaused(false);
      mediaRecorderRef.current?.start(1000);
      setState("recording");
      timerRef.current = window.setInterval(() => {
        if (pausedRef.current) return;
        const ms = accumulatedRef.current + (Date.now() - startedAtRef.current);
        setElapsedMs(ms);
        if (ms >= DOKUMENTACE_MAX_RECORD_MS) {
          stopRecording();
          return;
        }
        if (ms - lastRotateRef.current >= DOKUMENTACE_SEGMENT_MS) {
          const rec = mediaRecorderRef.current;
          if (rec && rec.state === "recording" && !rotatingRef.current) {
            lastRotateRef.current = ms;
            rotatingRef.current = true;
            rec.stop();
          }
        }
      }, 200);
    } catch (err) {
      setError(micErrorMessage(err));
      setMicReady(false);
      setState("error");
    }
  }

  function pauseRecording() {
    const rec = mediaRecorderRef.current;
    if (!rec || rec.state !== "recording") return;
    try {
      rec.pause();
      accumulatedRef.current += Date.now() - startedAtRef.current;
      setPaused(true);
    } catch {
      // iOS may not support pause — ignore
    }
  }

  function resumeRecording() {
    const rec = mediaRecorderRef.current;
    if (!rec || rec.state !== "paused") return;
    try {
      startedAtRef.current = Date.now();
      rec.resume();
      setPaused(false);
    } catch {
      // ignore
    }
  }

  function stopRecording() {
    const rec = mediaRecorderRef.current;
    if (!rec) return;
    if (rec.state === "recording" || rec.state === "paused") {
      if (rec.state === "recording") {
        accumulatedRef.current += Date.now() - startedAtRef.current;
      }
      setElapsedMs(accumulatedRef.current);
      rotatingRef.current = false;
      finalizingRef.current = true;
      try {
        rec.stop();
      } catch {
        clearTimer();
        stopTracks();
        void processBlobs([...segmentBlobsRef.current]);
      }
    }
  }

  async function onFileSelected(file: File | undefined) {
    if (!file) return;
    if (!consent) setConsent(true);
    setError(null);
    setGateHint(null);
    setState("processing");
    try {
      const prepared = await prepareUploadBlobs(file, DOKUMENTACE_SOFT_UPLOAD_BYTES);
      await processBlobs(prepared.blobs);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg.slice(0, 240));
      setState("error");
    }
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
          title: title || "MeDiktor",
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
    a.download = `mediktor-${templateId}.txt`;
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
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
          <Button
            type="button"
            size="sm"
            variant={micReady ? "outline" : "default"}
            className={`h-10 shrink-0 rounded-full ${micReady ? "border-emerald-300 text-emerald-800" : "bg-[#005B96]"}`}
            disabled={micBusy || recording || processing}
            onClick={() => void enableMicrophone()}
          >
            {micBusy ? (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            ) : micReady ? (
              <CheckCircle2 className="mr-1.5 h-4 w-4" />
            ) : (
              <Mic className="mr-1.5 h-4 w-4" />
            )}
            {micReady ? "Mikrofon povolen" : "1. Povolit mikrofon"}
          </Button>
        </div>

        <p className="mt-3 text-xs leading-5 text-slate-500">
          Po stažení: nejdříve „Povolit mikrofon“, pak „Nahrávat“. Až 60 minut (automatické dělení po 2 min — spolehlivý přenos). Zápis se uloží do účtu.
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
                {segmentCount > 0 ? (
                  <span className="ml-2 text-xs text-slate-400">
                    · segmenty {segmentCount}
                  </span>
                ) : null}
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
                {micReady ? "2. Nahrávat" : "Nahrávat"}
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
              disabled={recording || processing}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="mr-2 h-4 w-4" />
              Nahrát soubor
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept={MEDIKTOR_FILE_ACCEPT}
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                e.target.value = "";
                void onFileSelected(f);
              }}
            />
          </div>
        </div>
        {processing ? (
          <p className="mt-3 flex items-center gap-2 text-sm text-slate-600">
            <Loader2 className="h-4 w-4 animate-spin text-[#005B96]" />
            Přepisuji soubor / nahrávku a sestavuji zápis… Audio se neukládá.
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
                  MeDiktor od 390 Kč
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
        MeDiktor od MedScopeGlobal není zdravotnický prostředek. Výstup je návrh AI —
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
