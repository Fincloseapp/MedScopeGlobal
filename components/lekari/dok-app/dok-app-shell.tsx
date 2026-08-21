"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FilePlus2, History, BookOpen, UserRound, Wifi, WifiOff, LogIn } from "lucide-react";
import { InstallAppButton } from "@/components/lekari/dok-app/install-app-button";
import { DokAppRecord } from "@/components/lekari/dok-app/dok-app-record";
import { DokAppHistory } from "@/components/lekari/dok-app/dok-app-history";
import { DokAppGuide } from "@/components/lekari/dok-app/dok-app-guide";
import { DokAppAccount } from "@/components/lekari/dok-app/dok-app-account";
import { DokAppGate } from "@/components/lekari/dok-app/dok-app-gate";
import { MediktorMark } from "@/components/lekari/mediktor-mark";
import { AppAccountStatus } from "@/components/apps/app-account-status";
import { AppSectionNav } from "@/components/apps/app-section-nav";
import { AppBrandVisual } from "@/components/apps/app-brand-visual";
import { MEDIKTOR } from "@/lib/lekari/dokumentace/branding";
import { MEDIKTOR_APP } from "@/lib/apps/catalog";
import { guestAccess, type AppAccessInfo } from "@/lib/apps/access-status";

type TabId = "zapis" | "historie" | "navod" | "ucet";

const TABS = [
  { id: "zapis" as const, label: "Zápis", icon: FilePlus2 },
  { id: "historie" as const, label: "Historie", icon: History },
  { id: "navod" as const, label: "Návod", icon: BookOpen },
  { id: "ucet" as const, label: "Účet", icon: UserRound },
];

type EligibilityState = {
  eligible: boolean;
  canInstall: boolean;
  message: string;
  displayName?: string | null;
  email?: string | null;
  facilities: Array<{ id: string; name: string; role: string }>;
  loginUrl?: string;
  verifyUrl?: string;
  isVip?: boolean;
  access?: AppAccessInfo;
};

const FALLBACK_ACCESS = guestAccess(
  "/login?next=/app/dokumentace",
  "/predplatne#dokumentace",
  "Host · vyžaduje ověřeného lékaře"
);

function initialTab(): TabId {
  // Always same on server + first client paint (avoid hydration mismatch).
  return "zapis";
}

export function DokAppShell() {
  const [tab, setTab] = useState<TabId>(initialTab);
  const [online, setOnline] = useState(true);
  const [elig, setElig] = useState<EligibilityState | null>(null);
  const [loading, setLoading] = useState(true);
  const [linkHint, setLinkHint] = useState<string | null>(null);

  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("tab");
    if (t === "historie" || t === "navod" || t === "ucet" || t === "zapis") {
      setTab(t);
    }
  }, []);

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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const link = params.get("link");
    if (link) {
      try {
        sessionStorage.setItem("dokumentace_install_link", link);
        setLinkHint(
          "QR odkaz je vázaný na lékařský účet. Přihlaste se stejným účtem — zápisy a historie se propojí."
        );
      } catch {
        setLinkHint(
          "QR odkaz je vázaný na lékařský účet. Přihlaste se stejným účtem pro synchronizaci."
        );
      }
    }
  }, []);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/lekari/dokumentace/eligibility", {
          credentials: "same-origin",
        });
        if (res.ok) {
          const data = (await res.json()) as EligibilityState & {
            loginUrl?: string;
            verifyUrl?: string;
          };
          setElig(data);
        } else {
          setElig({
            eligible: false,
            canInstall: false,
            message: "Pro aplikaci se přihlaste ověřeným lékařským účtem.",
            facilities: [],
            access: FALLBACK_ACCESS,
          });
        }
      } catch {
        setElig({
          eligible: false,
          canInstall: false,
          message: "Nepodařilo se ověřit přístup. Zkontrolujte připojení.",
          facilities: [],
          access: FALLBACK_ACCESS,
        });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("tab", tab);
    window.history.replaceState({}, "", url.toString());
  }, [tab]);

  useEffect(() => {
    if (!elig?.eligible && (tab === "zapis" || tab === "historie")) {
      setTab("ucet");
    }
  }, [elig?.eligible, tab]);

  const access = elig?.access ?? FALLBACK_ACCESS;
  const loginUrl = elig?.loginUrl || access.loginUrl;
  const sectionTabs = TABS.map((t) => ({
    ...t,
    locked: !elig?.eligible && (t.id === "zapis" || t.id === "historie"),
  }));

  return (
    <div
      className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[#f4f9fc] text-[#021d33]"
      style={{
        paddingTop: "env(safe-area-inset-top)",
        paddingLeft: "env(safe-area-inset-left)",
        paddingRight: "env(safe-area-inset-right)",
      }}
    >
      <header className="shrink-0 border-b border-[#0a4a78] bg-[#005B96] px-3 py-2.5 text-white sm:px-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2.5">
            <MediktorMark
              size="sm"
              className="shrink-0 rounded-[22%] ring-1 ring-white/30"
            />
            <div className="min-w-0">
              <p className="truncate text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-100/90">
                {MEDIKTOR.provider}
              </p>
              <h1 className="truncate text-base font-semibold leading-tight sm:text-lg">
                {MEDIKTOR.shortName}
              </h1>
              <p className="truncate text-[10px] text-sky-100/70">{MEDIKTOR.lockline}</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <span
              className={`hidden items-center gap-1 rounded-full px-2 py-1 text-[10px] font-medium sm:inline-flex ${
                online
                  ? "bg-emerald-400/20 text-emerald-100"
                  : "bg-amber-400/20 text-amber-100"
              }`}
              title={online ? "Online" : "Offline"}
            >
              {online ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
              {online ? "Online" : "Offline"}
            </span>
            {access.authenticated ? (
              <button
                type="button"
                onClick={() => setTab("ucet")}
                className="inline-flex max-w-[9rem] items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1.5 text-[11px] font-semibold text-white touch-manipulation hover:bg-white/25"
              >
                <UserRound className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{access.accountLabel}</span>
              </button>
            ) : (
              <Link
                href={loginUrl}
                className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1.5 text-[11px] font-bold text-[#005B96] shadow-sm touch-manipulation hover:bg-sky-50 sm:px-3 sm:text-xs"
              >
                <LogIn className="h-3.5 w-3.5" />
                Přihlášení
              </Link>
            )}
            <InstallAppButton gated canInstall={Boolean(elig?.canInstall)} />
          </div>
        </div>
      </header>

      <AppAccountStatus
        access={access}
        accent="#005B96"
        onOpenAccount={() => setTab("ucet")}
      />

      <AppSectionNav
        tabs={sectionTabs}
        active={tab}
        onChange={setTab}
        accent="#005B96"
        ariaLabel={`${MEDIKTOR.shortName} sekce`}
      />

      <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-[#f4f9fc] pb-[calc(4.25rem+env(safe-area-inset-bottom))] md:pb-0">
        <div className="mx-auto w-full max-w-3xl">
          <AppBrandVisual
            app={MEDIKTOR_APP}
            className="border-b border-[#cfe1f3] sm:mx-4 sm:mt-3 sm:rounded-2xl sm:border"
          />
        </div>
        {loading ? (
          <p className="px-4 py-16 text-center text-sm text-slate-500">Načítám aplikaci…</p>
        ) : !elig?.eligible && (tab === "zapis" || tab === "historie") ? (
          <DokAppGate
            message={elig?.message || "Stažení a zápisy jsou jen pro ověřené lékaře."}
            loginUrl={elig?.loginUrl}
            verifyUrl={elig?.verifyUrl}
            linkedHint={linkHint}
          />
        ) : tab === "zapis" ? (
          <DokAppRecord />
        ) : tab === "historie" ? (
          <DokAppHistory />
        ) : tab === "navod" ? (
          <DokAppGuide />
        ) : (
          <DokAppAccount
            eligibility={elig}
            linkHint={linkHint}
            onEligibility={setElig}
          />
        )}
      </main>
    </div>
  );
}
