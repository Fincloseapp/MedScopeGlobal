"use client";

import { useEffect, useState } from "react";
import { FilePlus2, History, BookOpen, UserRound, Wifi, WifiOff } from "lucide-react";
import { InstallAppButton } from "@/components/lekari/dok-app/install-app-button";
import { DokAppRecord } from "@/components/lekari/dok-app/dok-app-record";
import { DokAppHistory } from "@/components/lekari/dok-app/dok-app-history";
import { DokAppGuide } from "@/components/lekari/dok-app/dok-app-guide";
import { DokAppAccount } from "@/components/lekari/dok-app/dok-app-account";

type TabId = "zapis" | "historie" | "navod" | "ucet";

const TABS: { id: TabId; label: string; icon: typeof FilePlus2 }[] = [
  { id: "zapis", label: "Zápis", icon: FilePlus2 },
  { id: "historie", label: "Historie", icon: History },
  { id: "navod", label: "Návod", icon: BookOpen },
  { id: "ucet", label: "Účet", icon: UserRound },
];

function initialTab(): TabId {
  if (typeof window === "undefined") return "zapis";
  const t = new URLSearchParams(window.location.search).get("tab");
  if (t === "historie" || t === "navod" || t === "ucet" || t === "zapis") return t;
  return "zapis";
}

export function DokAppShell() {
  const [tab, setTab] = useState<TabId>(initialTab);
  const [online, setOnline] = useState(true);

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
    const url = new URL(window.location.href);
    url.searchParams.set("tab", tab);
    window.history.replaceState({}, "", url.toString());
  }, [tab]);

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
            <InstallAppButton />
          </div>
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-[#f4f9fc]">
        {tab === "zapis" ? <DokAppRecord /> : null}
        {tab === "historie" ? <DokAppHistory /> : null}
        {tab === "navod" ? <DokAppGuide /> : null}
        {tab === "ucet" ? <DokAppAccount /> : null}
      </main>

      <nav
        className="shrink-0 border-t border-[#cfe1f3] bg-white/95 backdrop-blur"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        aria-label="Aplikace Dokumentace"
      >
        <div className="mx-auto grid max-w-3xl grid-cols-4">
          {TABS.map(({ id, label, icon: Icon }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={`flex flex-col items-center gap-0.5 px-1 py-2.5 text-[11px] font-medium transition-colors ${
                  active ? "text-[#005B96]" : "text-slate-500"
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
