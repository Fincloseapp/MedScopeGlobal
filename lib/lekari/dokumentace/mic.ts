/** Client-only microphone helpers for MeDiktor (PWA + web). */

export type MicPermissionState =
  | "unknown"
  | "prompt"
  | "granted"
  | "denied"
  | "unsupported";

export function isMobileClient(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
}

export function isIosClient(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

export function isSecureMicContext(): boolean {
  return typeof window !== "undefined" && window.isSecureContext;
}

export function pickRecorderMimeType(): string {
  if (typeof MediaRecorder === "undefined") {
    return isIosClient() ? "audio/mp4" : "audio/webm";
  }
  // iOS Safari: prefer mp4/aac — webm is often unsupported and breaks start().
  if (isIosClient()) {
    if (MediaRecorder.isTypeSupported("audio/mp4")) return "audio/mp4";
    if (MediaRecorder.isTypeSupported("audio/aac")) return "audio/aac";
    if (MediaRecorder.isTypeSupported("audio/mpeg")) return "audio/mpeg";
  }
  if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
    return "audio/webm;codecs=opus";
  }
  if (MediaRecorder.isTypeSupported("audio/webm")) return "audio/webm";
  if (MediaRecorder.isTypeSupported("audio/mp4")) return "audio/mp4";
  if (MediaRecorder.isTypeSupported("audio/aac")) return "audio/aac";
  return "audio/webm";
}

export async function queryMicPermission(): Promise<MicPermissionState> {
  if (typeof navigator === "undefined") return "unknown";
  if (!isSecureMicContext()) return "unsupported";
  if (!navigator.mediaDevices?.getUserMedia) return "unsupported";
  try {
    if (navigator.permissions?.query) {
      const status = await navigator.permissions.query({
        name: "microphone" as PermissionName,
      });
      if (status.state === "granted") return "granted";
      if (status.state === "denied") return "denied";
      if (status.state === "prompt") return "prompt";
    }
  } catch {
    // iOS Safari often rejects permissions.query for microphone
  }
  return "unknown";
}

/**
 * Request a live mic stream. Must run from a user gesture on mobile.
 * Prefer simple `{ audio: true }` on phones — advanced constraints break iOS Safari.
 */
export async function requestMicStream(): Promise<MediaStream> {
  if (!isSecureMicContext()) {
    throw Object.assign(new Error("HTTPS required for microphone"), {
      name: "SecurityError",
    });
  }
  if (!navigator.mediaDevices?.getUserMedia) {
    throw Object.assign(new Error("getUserMedia unavailable"), {
      name: "NotSupportedError",
    });
  }

  const mobile = isMobileClient();
  if (mobile) {
    try {
      return await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      const name =
        err && typeof err === "object" && "name" in err
          ? String((err as { name: string }).name)
          : "";
      if (name === "OverconstrainedError" || name === "ConstraintNotSatisfiedError") {
        return navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
          },
        });
      }
      throw err;
    }
  }

  try {
    return await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });
  } catch {
    return navigator.mediaDevices.getUserMedia({ audio: true });
  }
}

export function micErrorMessage(err: unknown): string {
  const name =
    err && typeof err === "object" && "name" in err
      ? String((err as { name: string }).name)
      : "";

  if (name === "SecurityError") {
    return "Mikrofon funguje jen přes zabezpečené HTTPS. Otevřete MeDiktor z https://medscopeglobal.com.";
  }
  if (name === "NotSupportedError") {
    return "Tento prohlížeč nepodporuje nahrávání. Použijte Safari (iPhone) nebo Chrome (Android), ideálně po přidání MeDiktoru na plochu.";
  }
  if (name === "NotFoundError" || name === "DevicesNotFoundError") {
    return "Mikrofon nebyl nalezen. Zkontrolujte, že zařízení má mikrofon a není používán jinou aplikací.";
  }
  if (
    name === "NotAllowedError" ||
    name === "PermissionDeniedError" ||
    name === "PermissionDismissedError"
  ) {
    return "Mikrofon nebyl povolen. Klepněte na „Povolit mikrofon“ a v systémovém dialogu zvolte Povolit.";
  }
  return "Nepodařilo se získat mikrofon. Klepněte na „Povolit mikrofon“ a zkuste znovu.";
}

/** Fallback only after browser prompt was denied/blocked. */
export function micBlockedFallbackHint(): string {
  if (isIosClient()) {
    return (
      "Když dialog nevyšel: iPhone → Nastavení → Safari (nebo MeDiktor) → Mikrofon → Povolit. " +
      "Pak se vraťte a znovu klepněte na „Povolit mikrofon“."
    );
  }
  if (isMobileClient()) {
    return (
      "Když dialog nevyšel: v Chrome klepněte na zámek / „i“ u adresy → Oprávnění → Mikrofon → Povolit. " +
      "Pak znovu klepněte na „Povolit mikrofon“."
    );
  }
  return (
    "Když je mikrofon zablokovaný: ikona zámku u adresy → Oprávnění webu → Mikrofon → Povolit."
  );
}

export function isMicPermissionDeniedError(err: unknown): boolean {
  const name =
    err && typeof err === "object" && "name" in err
      ? String((err as { name: string }).name)
      : "";
  return (
    name === "NotAllowedError" ||
    name === "PermissionDeniedError" ||
    name === "PermissionDismissedError"
  );
}
