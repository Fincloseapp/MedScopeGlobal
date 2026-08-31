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
import { buildLocalePath, resolveLocalePath } from "@/lib/i18n/locale-path";
import { setPreferredLocale, clearPreferredLocale } from "@/lib/i18n/detect-language";

function localeLabel(code: string): string {
  return GLOBAL_LOCALES.find((item) => item.code === code)?.label ?? code;
}

export function LocaleSwitcher({
  currentLocale = "cs",
  compact = false,
}: {
  currentLocale?: string;
  currentRegion?: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const [locale, setLocale] = useState(currentLocale);
  const [saving, setSaving] = useState(false);
  const isCzech = currentLocale === "cs" || currentLocale.startsWith("cs");

  function pathWithoutLocale(): string {
    const { pathname: stripped } = resolveLocalePath(pathname);
    return stripped || "/";
  }

  async function persist(nextLocale: string) {
    setSaving(true);
    setPreferredLocale(nextLocale);
    await fetch("/api/locale/set", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale: nextLocale }),
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
    <div className="flex items-center gap-1.5">
      <Select
        value={locale}
        disabled={saving}
        onValueChange={(value) => {
          setLocale(value);
          void persist(value);
        }}
      >
        <SelectTrigger
          className={
            compact
              ? "h-8 w-[7.25rem] border-black/[0.08] px-2 text-[11px] dark:border-white/15"
              : "h-8 min-w-[8.5rem] max-w-[11rem] text-xs"
          }
          aria-label={isCzech ? "Jazyk webu" : "Site language"}
        >
          <SelectValue placeholder={localeLabel(locale)}>{localeLabel(locale)}</SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-80">
          {GLOBAL_LOCALES.map((item) => (
            <SelectItem key={item.code} value={item.code}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <button
        type="button"
        disabled={saving}
        onClick={() => void syncDeviceLanguage()}
        className="hidden text-[10px] text-muted-foreground underline hover:text-foreground lg:inline"
        title={isCzech ? "Použít jazyk zařízení" : "Use browser / device language"}
      >
        {isCzech ? "Auto" : "Auto"}
      </button>
    </div>
  );
}
