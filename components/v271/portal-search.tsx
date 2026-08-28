"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Sparkles } from "lucide-react";
import { PORTAL_SEARCH_TABS } from "@/lib/v271/portal";
import Link from "next/link";
import { AppOpenLink, isStandaloneAppHref } from "@/components/apps/app-origin-bar";
import { getPortalUi } from "@/lib/i18n/portal-copy";

export function PortalSearch({ locale = "cs" }: { locale?: string }) {
  const router = useRouter();
  const [tab, setTab] = useState<(typeof PORTAL_SEARCH_TABS)[number]["id"]>("search");
  const [q, setQ] = useState("");
  const ui = getPortalUi(locale);
  const tabs = [
    { id: "search" as const, label: ui.searchTab },
    { id: "ai" as const, label: ui.aiTab },
  ];
  const trending = [
    { label: ui.trendLongevity, href: "/verejnost/clanky?topic=dlouhovekost" },
    { label: "MediFlow", href: "/app/mediflow" },
    { label: ui.vipProtocols, href: "/vip/protokoly" },
    { label: "MeDipacient", href: "/app/pacient" },
    { label: "OrdiZapis", href: "/app/dokumentace" },
  ];

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const query = q.trim();
    if (tab === "ai") {
      router.push("/ai-asistent/verejnost");
      return;
    }
    router.push(query ? `/search?q=${encodeURIComponent(query)}` : "/search");
  }

  return (
    <div>
      <div className="flex gap-1 border-b border-slate-200">
        {tabs.map((item) => {
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold ${
                active
                  ? "border-b-2 border-[#005B96] text-[#005B96]"
                  : "text-slate-500 hover:text-[#021d33]"
              }`}
            >
              {item.id === "ai" ? <Sparkles className="h-3.5 w-3.5" aria-hidden /> : <Search className="h-3.5 w-3.5" aria-hidden />}
              {item.label}
            </button>
          );
        })}
      </div>
      <form onSubmit={onSubmit} className="mt-3 flex gap-2">
        <label className="sr-only" htmlFor="portal-q">
          {ui.searchLabel}
        </label>
        <input
          id="portal-q"
          name="q"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={tab === "ai" ? ui.searchAiPlaceholder : ui.searchPlaceholder}
          className="h-12 flex-1 rounded-lg border border-slate-300 bg-white px-4 text-base text-[#021d33] shadow-sm outline-none ring-[#005B96] placeholder:text-slate-400 focus:border-[#005B96] focus:ring-2"
        />
        <button
          type="submit"
          className="h-12 shrink-0 rounded-lg bg-[#005B96] px-5 text-sm font-semibold text-white hover:bg-[#004a7a]"
        >
          {tab === "ai" ? ui.openSubmit : ui.searchSubmit}
        </button>
      </form>
      <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
        <span className="font-medium text-slate-400">{ui.oftenSearched}</span>
        {trending.map((item) =>
          isStandaloneAppHref(item.href) ? (
            <AppOpenLink key={item.href} href={item.href} className="hover:text-[#005B96] hover:underline">
              {item.label}
            </AppOpenLink>
          ) : (
            <Link key={item.href} href={item.href} className="hover:text-[#005B96] hover:underline">
              {item.label}
            </Link>
          )
        )}
      </p>
    </div>
  );
}
