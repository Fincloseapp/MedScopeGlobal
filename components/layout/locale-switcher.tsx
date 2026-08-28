"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GLOBAL_LOCALES } from "@/lib/ecosystem/locales";
import { REGIONS } from "@/lib/i18n/config";
import { buildLocalePath, resolveLocalePath } from "@/lib/i18n/locale-path";
import { setPreferredLocale, clearPreferredLocale } from "@/lib/i18n/detect-language";
import { getPortalUi } from "@/lib/i18n/portal-copy";
import { cn } from "@/lib/utils";

export function LocaleSwitcher({
  currentLocale = "cs",
  currentRegion = "EU",
  compact = false,
}: {
  currentLocale?: string;
  currentRegion?: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [locale, setLocale] = useState(currentLocale);
  const [region, setRegion] = useState(currentRegion);
  const [saving, setSaving] = useState(false);
  const ui = getPortalUi(currentLocale);

  function pathWithoutLocale(): string {
    const { pathname: stripped } = resolveLocalePath(pathname);
    return stripped;
  }

  async function persist(nextLocale: string, nextRegion: string) {
    setSaving(true);
    setPreferredLocale(nextLocale);
    await fetch("/api/locale/set", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale: nextLocale, region: nextRegion }),
    });
    setSaving(false);
    router.push(buildLocalePath(nextLocale, pathWithoutLocale()));
    router.refresh();
  }

  async function syncDeviceLanguage() {
    setSaving(true);
    clearPreferredLocale();
    await fetch("/api/locale/use-device", { method: "POST" });
    setSaving(false);
    router.refresh();
  }

  return (
    <div className={cn("flex items-center gap-1.5", compact && "max-w-full")}>
      <Select
        value={locale}
        disabled={saving}
        onValueChange={(v) => {
          setLocale(v);
          void persist(v, region);
        }}
      >
        <SelectTrigger
          className={cn("h-8 text-xs", compact ? "w-[7.5rem]" : "w-[10.5rem]")}
          aria-label={ui.useDeviceLanguage}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="max-h-80">
          {GLOBAL_LOCALES.map((item) => (
            <SelectItem key={item.code} value={item.code}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {compact ? null : (
        <Select
          value={region}
          disabled={saving}
          onValueChange={(v) => {
            setRegion(v);
            void persist(locale, v);
          }}
        >
          <SelectTrigger className="h-8 w-[72px] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {REGIONS.map((r) => (
              <SelectItem key={r} value={r}>
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      <button
        type="button"
        disabled={saving}
        onClick={() => void syncDeviceLanguage()}
        className="text-[10px] text-muted-foreground underline hover:text-foreground"
        title={ui.useDeviceLanguage}
      >
        {ui.switcherAuto}
      </button>
    </div>
  );
}
