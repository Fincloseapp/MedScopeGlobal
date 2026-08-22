"use client";

import { useCallback, useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

export type MeDiprepPlatform = "ios" | "android" | "desktop" | "other";

/** Must match Next.js path so this SW cannot control /app/dokumentace (MeDiktor). */
export const MEDIPREP_PWA_SCOPE = "/app/priprava";
export const MEDIPREP_SW_URL = "/sw-mediprep.js";

let swPromise: Promise<ServiceWorkerRegistration | null> | null = null;
let deferredPrompt: BeforeInstallPromptEvent | null = null;
let bound = false;
const subs = new Set<() => void>();

function emit() {
  subs.forEach((fn) => fn());
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: window-controls-overlay)").matches ||
    Boolean(nav.standalone)
  );
}

export function isMeDiprepStandalone(): boolean {
  return isStandalone();
}

export function detectMeDiprepPlatform(): MeDiprepPlatform {
  if (typeof navigator === "undefined") return "other";
  const ua = navigator.userAgent || "";
  if (/iPhone|iPad|iPod/i.test(ua)) return "ios";
  if (/Android/i.test(ua)) return "android";
  if (/Windows|Macintosh|Linux/i.test(ua) && !/Mobile/i.test(ua)) return "desktop";
  return "other";
}

function swScript(reg: ServiceWorkerRegistration) {
  return reg.active?.scriptURL || reg.waiting?.scriptURL || reg.installing?.scriptURL || "";
}

export function ensureMeDiprepServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === "undefined") return Promise.resolve(null);
  if (!("serviceWorker" in navigator)) return Promise.resolve(null);
  if (!swPromise) {
    swPromise = (async () => {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(
        regs
          .filter((reg) => {
            const script = swScript(reg);
            const scopePath = new URL(reg.scope).pathname;
            const isPrep = script.includes("sw-mediprep.js") || script.includes("sw-meprep.js");
            // Trailing-slash scope never controls /app/priprava.
            if (isPrep && scopePath === `${MEDIPREP_PWA_SCOPE}/`) return true;
            // Old MeDiktor SW at "/" becomes controller of MeDiprep and blocks install.
            return script.includes("sw-dokumentace.js") && (scopePath === "/" || scopePath === "");
          })
          .map((reg) => reg.unregister().catch(() => false))
      );
      try {
        const reg = await navigator.serviceWorker.register(MEDIPREP_SW_URL, {
          scope: MEDIPREP_PWA_SCOPE,
          updateViaCache: "none",
        });
        void reg.update();
        return reg;
      } catch {
        return null;
      }
    })();
  }
  return swPromise;
}

function bindInstallEvents() {
  if (typeof window === "undefined" || bound) return;
  bound = true;
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    emit();
  });
  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    emit();
  });
}

export async function promptMeDiprepInstall(): Promise<"accepted" | "dismissed" | "unavailable"> {
  bindInstallEvents();
  await ensureMeDiprepServiceWorker();
  if (!deferredPrompt) return "unavailable";
  const event = deferredPrompt;
  deferredPrompt = null;
  emit();
  try {
    await event.prompt();
    const choice = await event.userChoice;
    return choice.outcome;
  } catch {
    return "dismissed";
  }
}

export function useMeDiprepPwa() {
  const [installed, setInstalled] = useState(false);
  const [canPrompt, setCanPrompt] = useState(false);
  const [platform, setPlatform] = useState<MeDiprepPlatform>("other");
  const [, bump] = useState(0);

  useEffect(() => {
    bindInstallEvents();
    setInstalled(isStandalone());
    setPlatform(detectMeDiprepPlatform());
    setCanPrompt(Boolean(deferredPrompt));
    void ensureMeDiprepServiceWorker();

    const onChange = () => {
      setInstalled(isStandalone());
      setCanPrompt(Boolean(deferredPrompt));
      bump((n) => n + 1);
    };
    subs.add(onChange);
    const mq = window.matchMedia("(display-mode: standalone)");
    mq.addEventListener?.("change", onChange);
    return () => {
      subs.delete(onChange);
      mq.removeEventListener?.("change", onChange);
    };
  }, []);

  const install = useCallback(async () => promptMeDiprepInstall(), []);

  return { installed, canPrompt, platform, install };
}
