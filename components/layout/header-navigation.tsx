"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { NavItem } from "@/lib/config/main-navigation";
import { cn } from "@/lib/utils";

const NAV_BASE =
  "inline-flex shrink-0 items-center whitespace-nowrap px-3.5 py-2 text-[14px] font-normal leading-none tracking-[0.2px] md:px-4 md:text-[14.5px] lg:px-5 lg:text-[15.5px] lg:font-normal xl:font-medium";

const NAV_LINK = cn(
  NAV_BASE,
  "text-slate-800 underline-offset-[3px] transition-colors hover:text-[#0055CC] hover:underline dark:text-[#E0E0E0] dark:hover:text-[#7CC4FF]"
);

const NAV_LINK_ACTIVE = "font-medium text-[#0055CC] underline dark:text-[#7CC4FF]";

const NAV_BUTTON = cn(
  NAV_BASE,
  "text-slate-800 underline-offset-[3px] transition-colors hover:text-[#0055CC] hover:underline after:ml-0.5 after:text-[10px] after:opacity-60 after:content-['▾'] dark:text-[#E0E0E0] dark:hover:text-[#7CC4FF]"
);

/** v23.2.9 — full menu visibility, no wrap, no hidden items on desktop */
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
      className="hidden min-w-0 flex-1 flex-nowrap items-center justify-end gap-0 overflow-visible md:flex lg:justify-center"
      aria-label="Hlavní navigace"
    >
      {mainMenu.map((item) => {
        const isOpen = openLabel === item.label;
        const hasChildren = Boolean(item.children?.length);
        const active = hasActiveParent(item.href);

        if (!hasChildren) {
          return (
            <Link key={item.label} href={item.href} className={cn(NAV_LINK, active && NAV_LINK_ACTIVE)}>
              {item.label}
            </Link>
          );
        }

        return (
          <div key={item.label} className="relative shrink-0">
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpenLabel(isOpen ? null : item.label)}
              className={cn(NAV_BUTTON, active && NAV_LINK_ACTIVE, isOpen && "text-[#0055CC] dark:text-[#7CC4FF]")}
            >
              {item.label}
            </button>
            {isOpen ? (
              <div className="absolute left-0 top-full z-50 mt-1.5 min-w-64 rounded-md border border-black/[0.06] bg-white py-1.5 shadow-md dark:border-white/10 dark:bg-slate-900">
                {item.children!.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    onClick={() => setOpenLabel(null)}
                    className={cn(
                      "block whitespace-normal px-5 py-2.5 text-[15px] tracking-[0.2px] transition-colors hover:text-[#0055CC] dark:hover:text-[#7CC4FF]",
                      isActiveChild(child.href)
                        ? "font-medium text-[#0055CC] dark:text-[#7CC4FF]"
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

export function V21DesktopNav({ mainMenu }: { mainMenu: NavItem[] }) {
  return <HeaderNavigation mainMenu={mainMenu} />;
}
