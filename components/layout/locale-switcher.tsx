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
import { LOCALES, REGIONS } from "@/lib/i18n/config";
import { buildLocalePath, resolveLocalePath } from "@/lib/i18n/locale-path";
import { setPreferredLocale, clearPreferredLocale } from "@/lib/i18n/detect-language";

export function LocaleSwitcher({
  currentLocale = "cs",
  currentRegion = "EU",
}: {
  currentLocale?: string;
  currentRegion?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [locale, setLocale] = useState(currentLocale);
  const [region, setRegion] = useState(currentRegion);
  const [saving, setSaving] = useState(false);

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
    <div className="flex items-center gap-2">
      <Select
        value={locale}
        disabled={saving}
        onValueChange={(v) => {
          setLocale(v);
          void persist(v, region);
        }}
      >
        <SelectTrigger className="h-8 w-[88px] text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {LOCALES.slice(0, 8).map((l) => (
            <SelectItem key={l} value={l}>
              {l.toUpperCase()}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
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
      <button
        type="button"
        disabled={saving}
        onClick={() => void syncDeviceLanguage()}
        className="text-[10px] text-muted-foreground underline hover:text-foreground"
        title="Use browser / device language"
      >
        Auto
      </button>
    </div>
  );
}
