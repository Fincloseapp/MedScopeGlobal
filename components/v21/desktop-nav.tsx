"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { NavItem } from "@/lib/config/main-navigation";

/** Desktop menu — pouze jedno rozbalené submenu najednou */
export function V21DesktopNav({ mainMenu }: { mainMenu: NavItem[] }) {
  const pathname = usePathname();
  const [openLabel, setOpenLabel] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOpenLabel(null);
  }, [pathname]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenLabel(null);
      }
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  const hasActiveParent = (href: string) =>
    href === "/" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  const isActiveChild = (href: string) => pathname === href;

  return (
    <nav ref={navRef} className="hidden flex-1 items-center justify-center xl:flex" aria-label="Hlavní navigace">
      {mainMenu.map((item) => {
        const isOpen = openLabel === item.label;
        const hasChildren = Boolean(item.children?.length);

        if (!hasChildren) {
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`mx-0.5 rounded-full px-2.5 py-2 text-[11px] font-semibold transition hover:bg-slate-50 hover:text-primary ${hasActiveParent(item.href) ? "bg-slate-50 text-primary" : "text-slate-700"}`}
            >
              {item.label}
            </Link>
          );
        }

        return (
          <div key={item.label} className="relative px-1">
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpenLabel(isOpen ? null : item.label)}
              className={`flex items-center gap-1 rounded-full px-2.5 py-2 text-[11px] font-semibold transition hover:bg-slate-50 hover:text-primary ${hasActiveParent(item.href) ? "bg-slate-50 text-primary" : "text-slate-700"}`}
            >
              {item.label}
              <ChevronDown className={`h-3.5 w-3.5 text-slate-500 transition ${isOpen ? "rotate-180" : ""}`} />
            </button>
            {isOpen && (
              <div className="absolute left-0 top-full z-50 mt-2 min-w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg">
                {item.children!.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    onClick={() => setOpenLabel(null)}
                    className={`block rounded-xl px-3 py-2 transition hover:bg-slate-50 hover:text-primary ${isActiveChild(child.href) ? "bg-slate-50 font-semibold text-primary" : "text-slate-700"}`}
                  >
                    <span className="text-sm">{child.label}</span>
                    {child.description && (
                      <span className="mt-0.5 block text-xs text-muted-foreground">{child.description}</span>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}
