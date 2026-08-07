"use client";

import { useEffect, useState } from "react";
import { FilePlus2, History, BookOpen, UserRound, Wifi, WifiOff } from "lucide-react";
import { InstallAppButton } from "@/components/lekari/dok-app/install-app-button";
import { DokAppRecord } from "@/components/lekari/dok-app/dok-app-record";
import { DokAppHistory } from "@/components/lekari/dok-app/dok-app-history";
import { DokAppGuide } from "@/components/lekari/dok-app/dok-app-guide";
import { DokAppAccount } from "@/components/lekari/dok-app/dok-app-account";
import { DokAppGate } from "@/components/lekari/dok-app/dok-app-gate";

type TabId = "zapis" | "historie" | "navod" | "ucet";

const TABS: { id: TabId; label: string; icon: typeof FilePlus2 }[] = [
  { id: "zapis", label: "Zápis", icon: FilePlus2 },
  { id: "historie", label: "Historie", icon: History },
  { id: "navod", label: "Návod", icon: BookOpen },
  { id: "ucet", label: "Účet", icon: UserRound },
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
};

function initialTab(): TabId {
  if (typeof window === "undefined") return "zapis";
  const t = new URLSearchParams(window.location.search).get("tab");
  if (t === "historie" || t === "navod" || t === "ucet" || t === "zapis") return t;
  return "zapis";
}

export function DokAppShell() {
  const [tab, setTab] = useState<TabId>(initialTab);
  const [online, setOnline] = useState(true);
  const [elig, setElig] = useState<EligibilityState | null>(null);
  const [loading, setLoading] = useState(true);
  const [linkHint, setLinkHint] = useState<string | null>(null);

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
          });
        }
      } catch {
        setElig({
          eligible: false,
          canInstall: false,
          message: "Nepodařilo se ověřit přístup. Zkontrolujte připojení.",
          facilities: [],
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

  return (
    <div
      className="flex h-[100dvh] flex-col overflow-hidden bg-[#f4f9fc] text-[#021d33]"
      style={{
        paddingTop: "env(safe-area-inset-top)",
        paddingLeft: "env(safe-area-inset-left)",
        paddingRight: "env(safe-area-inset-right)",
      }}
    >
      <header className="shrink-0 border-b border-[#0a4a78] bg-[#005B96] px-3 py-2.5 text-white sm:px-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-100/90">
              MedScope
            </p>
            <h1 className="truncate text-base font-semibold leading-tight sm:text-lg">
              Dokumentace
            </h1>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-medium ${
                online
                  ? "bg-emerald-400/20 text-emerald-100"
                  : "bg-amber-400/20 text-amber-100"
              }`}
              title={online ? "Online" : "Offline"}
            >
              {online ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
              {online ? "Online" : "Offline"}
            </span>
            <InstallAppButton gated canInstall={Boolean(elig?.canInstall)} />
          </div>
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-[#f4f9fc]">
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

      <nav
        className="shrink-0 border-t border-[#cfe1f3] bg-white/95 backdrop-blur"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        aria-label="Aplikace Dokumentace"
      >
        <div className="mx-auto grid max-w-3xl grid-cols-4">
          {TABS.map(({ id, label, icon: Icon }) => {
            const active = tab === id;
            const locked = !elig?.eligible && (id === "zapis" || id === "historie");
            return (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={`flex flex-col items-center gap-0.5 px-1 py-2.5 text-[11px] font-medium transition-colors ${
                  active ? "text-[#005B96]" : locked ? "text-slate-300" : "text-slate-500"
                }`}
                aria-current={active ? "page" : undefined}
              >
                <Icon className={`h-5 w-5 ${active ? "text-[#005B96]" : "text-slate-400"}`} />
                {label}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
