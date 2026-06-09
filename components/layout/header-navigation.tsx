"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { NavItem } from "@/lib/config/main-navigation";
import { cn } from "@/lib/utils";

const NAV_LINK =
  "inline-flex items-center px-[14px] py-2 text-[15px] font-normal tracking-[0.2px] text-slate-800 transition-colors hover:text-[#0055CC] hover:underline dark:text-[#E0E0E0] dark:hover:text-sky-300 lg:px-[18px] lg:text-base lg:font-medium";

const NAV_LINK_ACTIVE =
  "font-medium text-[#0055CC] underline underline-offset-4 dark:text-sky-300";

const NAV_BUTTON =
  "inline-flex items-center gap-1 px-[14px] py-2 text-[15px] font-normal tracking-[0.2px] text-slate-800 transition-colors hover:text-[#0055CC] dark:text-[#E0E0E0] dark:hover:text-sky-300 lg:px-[18px] lg:text-base lg:font-medium";

/** NEJM-level desktop navigation — clean typography, no leftover nodes */
export function HeaderNavigation({ mainMenu }: { mainMenu: NavItem[] }) {
  const pathname = usePathname();
  const [openLabel, setOpenLabel] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);

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
    <nav
      ref={navRef}
      className="hidden items-center lg:flex"
      aria-label="Hlavní navigace"
    >
      {mainMenu.map((item) => {
        const isOpen = openLabel === item.label;
        const hasChildren = Boolean(item.children?.length);
        const active = hasActiveParent(item.href);

        if (!hasChildren) {
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(NAV_LINK, active && NAV_LINK_ACTIVE)}
            >
              {item.label}
            </Link>
          );
        }

        return (
          <div key={item.label} className="relative">
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpenLabel(isOpen ? null : item.label)}
              className={cn(NAV_BUTTON, active && NAV_LINK_ACTIVE)}
            >
              {item.label}
              <ChevronDown
                className={cn("h-4 w-4 opacity-60 transition-transform", isOpen && "rotate-180")}
                aria-hidden
              />
            </button>
            {isOpen ? (
              <div className="absolute left-0 top-full z-50 mt-1 min-w-64 rounded-lg border border-black/[0.08] bg-white py-2 shadow-lg dark:border-white/10 dark:bg-slate-900">
                {item.children!.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    onClick={() => setOpenLabel(null)}
                    className={cn(
                      "block px-4 py-2.5 text-[15px] tracking-[0.2px] transition-colors hover:bg-slate-50 hover:text-[#0055CC] dark:hover:bg-slate-800 dark:hover:text-sky-300",
                      isActiveChild(child.href)
                        ? "font-medium text-[#0055CC] dark:text-sky-300"
                        : "text-slate-700 dark:text-[#E0E0E0]"
                    )}
                  >
                    {child.label}
                    {child.description ? (
                      <span className="mt-0.5 block text-xs font-normal text-slate-500 dark:text-slate-400">
                        {child.description}
                      </span>
                    ) : null}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        );
      })}
    </nav>
  );
}

/** @deprecated Use HeaderNavigation — kept for backward compatibility */
export function V21DesktopNav({ mainMenu }: { mainMenu: NavItem[] }) {
  return <HeaderNavigation mainMenu={mainMenu} />;
}
