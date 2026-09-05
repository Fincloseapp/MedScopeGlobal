"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { NavItem } from "@/lib/config/main-navigation";
import { cn } from "@/lib/utils";
import { getSurfaceCopy } from "@/lib/i18n/surface-copy";

function pathOf(href: string) {
  return href.split("#")[0]?.split("?")[0] ?? href;
}

function matchesPath(pathname: string, href: string) {
  const path = pathOf(href);
  if (path === "/") return pathname === "/" || pathname === "";
  return pathname === path || pathname.startsWith(`${path}/`);
}

export function HeaderNavigation({ mainMenu, locale = "cs" }: { mainMenu: NavItem[]; locale?: string }) {
  const pathname = usePathname() ?? "";
  const [openLabel, setOpenLabel] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const surface = getSurfaceCopy(locale);

  useEffect(() => {
    setOpenLabel(null);
  }, [pathname]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenLabel(null);
      }
    }
    function onEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenLabel(null);
    }
    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onEscape);
    };
  }, []);

  const open = (label: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenLabel(label);
  };
  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenLabel(null), 160);
  };

  return (
    <nav
      ref={navRef}
      className="header-nav-bar relative flex w-full min-w-0 flex-wrap items-stretch justify-start gap-x-0.5"
      aria-label={surface.mainNav}
      data-nav="primary"
    >
      {mainMenu.map((item) => {
        const isOpen = openLabel === item.label;
        const hasChildren = Boolean(item.children?.length);
        const active =
          matchesPath(pathname, item.href) ||
          Boolean(item.children?.some((child) => matchesPath(pathname, child.href)));

        return (
          <div
            key={item.label}
            className="relative flex items-stretch"
            onMouseEnter={() => hasChildren && open(item.label)}
            onMouseLeave={scheduleClose}
          >
            <Link
              href={item.href}
              className={cn(
                "inline-flex items-center whitespace-nowrap px-2.5 py-2 text-[13px] font-semibold tracking-[0.01em] transition-colors xl:px-3 xl:text-sm",
                active
                  ? "text-[#005B96] underline decoration-[#005B96]/40 underline-offset-4"
                  : "text-[#021d33] hover:text-[#005B96] dark:text-slate-100"
              )}
            >
              {item.label}
            </Link>
            {hasChildren ? (
              <button
                type="button"
                aria-expanded={isOpen}
                aria-haspopup="menu"
                aria-label={`${surface.expandMenu} ${item.label}`}
                onClick={() => setOpenLabel(isOpen ? null : item.label)}
                className={cn(
                  "-ml-1 inline-flex items-center px-1 text-[#021d33] hover:text-[#005B96] dark:text-slate-100",
                  isOpen && "text-[#005B96]"
                )}
              >
                <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", isOpen && "rotate-180")} />
              </button>
            ) : null}

            {hasChildren && isOpen ? (
              <div
                role="menu"
                className="absolute left-0 top-full z-[70] mt-0 min-w-[20rem] max-w-[min(36rem,calc(100vw-1.5rem))] rounded-xl border border-[#d9e8f4] bg-white p-3 shadow-xl dark:border-white/10 dark:bg-slate-950"
              >
                <p className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#005B96]">
                  {item.label}
                </p>
                <div className={cn("grid gap-1", (item.children?.length ?? 0) > 4 ? "sm:grid-cols-2" : "grid-cols-1")}>
                  {item.children!.map((child) => (
                    <Link
                      key={`${child.href}-${child.label}`}
                      href={child.href}
                      role="menuitem"
                      onClick={() => setOpenLabel(null)}
                      className={cn(
                        "rounded-lg px-3 py-2.5 transition-colors hover:bg-[#f4f8fc] dark:hover:bg-white/5",
                        matchesPath(pathname, child.href)
                          ? "bg-[#f0f7ff] text-[#005B96]"
                          : "text-[#021d33] dark:text-slate-100"
                      )}
                    >
                      <span className="block text-sm font-semibold leading-5">{child.label}</span>
                      {child.description ? (
                        <span className="mt-0.5 block text-xs font-normal leading-5 text-slate-500 dark:text-slate-400">
                          {child.description}
                        </span>
                      ) : null}
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        );
      })}
    </nav>
  );
}

export function V21DesktopNav({ mainMenu, locale = "cs" }: { mainMenu: NavItem[]; locale?: string }) {
  return <HeaderNavigation mainMenu={mainMenu} locale={locale} />;
}
