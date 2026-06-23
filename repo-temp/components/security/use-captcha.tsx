"use client";

import { useCallback, useState } from "react";
import { TurnstileWidget } from "@/components/security/turnstile-widget";

export function useCaptchaToken(siteKey: string | null) {
  const [token, setToken] = useState<string>("");

  const onVerify = useCallback((t: string) => setToken(t), []);

  const widget = siteKey ? (
    <TurnstileWidget siteKey={siteKey} onVerify={onVerify} />
  ) : null;

  return { token, widget, required: Boolean(siteKey) };
}

export function getTurnstileSiteKeyClient(): string | null {
  return process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? null;
}
