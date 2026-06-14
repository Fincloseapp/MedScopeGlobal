"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import type { NavItem } from "@/lib/config/main-navigation";
import { cn } from "@/lib/utils";

const NAV_ITEM =
  "inline-flex shrink-0 items-center whitespace-nowrap py-1 text-[15.5px] font-normal leading-none tracking-[0.2px] lg:font-medium";

const NAV_LINK = cn(
  NAV_ITEM,
  "text-slate-800 underline-offset-[3px] transition-colors hover:text-[#0055CC] hover:underline dark:text-[#E0E0E0] dark:hover:text-[#7CC4FF]"
);

const NAV_LINK_ACTIVE = "font-medium text-[#0055CC] underline dark:text-[#7CC4FF]";

const NAV_BUTTON = cn(
  NAV_ITEM,
  "text-slate-800 underline-offset-[3px] transition-colors hover:text-[#0055CC] hover:underline after:ml-0.5 after:text-[10px] after:opacity-60 after:content-['▾'] dark:text-[#E0E0E0] dark:hover:text-[#7CC4FF]"
);

const DROPDOWN_PANEL = cn(
  "z-[60] min-w-64 max-w-[min(20rem,calc(100vw-1rem))] rounded-md border border-black/[0.06] bg-white py-1.5 shadow-lg",
  "max-h-[min(70dvh,28rem)] overflow-y-auto overscroll-contain",
  "dark:border-white/10 dark:bg-slate-900"
);

function NavDropdownPanel({
  open,
  anchorEl,
  children,
}: {
  open: boolean;
  anchorEl: HTMLButtonElement | null;
  children: React.ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<CSSProperties>({ visibility: "hidden" });

  useLayoutEffect(() => {
    if (!open || !anchorEl) return;

    const update = () => {
      const anchor = anchorEl.getBoundingClientRect();
      const panel = panelRef.current;
      if (!panel) return;

      const margin = 8;
      const gap = 6;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const panelW = panel.offsetWidth || 256;
      const panelH = panel.offsetHeight || 320;
      const maxTop = Math.max(margin, vh - panelH - margin);

      let top = anchor.bottom + gap;
      let left = anchor.right - panelW;

      if (top + panelH > vh - margin) {
        const topAbove = anchor.top - panelH - gap;
        top = topAbove >= margin ? topAbove : margin;
      }

      top = Math.max(margin, Math.min(top, maxTop));

      if (left < margin) left = margin;
      if (left + panelW > vw - margin) left = Math.max(margin, vw - panelW - margin);

      setStyle({
        position: "fixed",
        top: Math.round(top),
        left: Math.round(left),
        maxHeight: `min(70dvh, calc(100dvh - ${margin * 2}px))`,
        visibility: "visible",
      });
    };

    update();
    requestAnimationFrame(update);
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open, anchorEl, children]);

  if (!open) return null;

  return (
    <div ref={panelRef} style={style} className={DROPDOWN_PANEL} role="menu">
      {children}
    </div>
  );
}

/** v26.1 — viewport-safe dropdowns (fixed anchor, scroll, flip) */
export function HeaderNavigation({ mainMenu }: { mainMenu: NavItem[] }) {
  const pathname = usePathname();
  const [openLabel, setOpenLabel] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

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

  const hasActiveParent = (href: string) =>
    href === "/" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  const isActiveChild = (href: string) => pathname === href;

  return (
    <nav
      ref={navRef}
      className="hidden min-w-0 flex-1 flex-nowrap items-center justify-end gap-4 overflow-visible md:flex lg:gap-[17px] xl:gap-[18px]"
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
              ref={(el) => {
                buttonRefs.current[item.label] = el;
              }}
              type="button"
              aria-expanded={isOpen}
              aria-haspopup="menu"
              onClick={() => setOpenLabel(isOpen ? null : item.label)}
              className={cn(NAV_BUTTON, active && NAV_LINK_ACTIVE, isOpen && "text-[#0055CC] dark:text-[#7CC4FF]")}
            >
              {item.label}
            </button>
            <NavDropdownPanel open={isOpen} anchorEl={buttonRefs.current[item.label]}>
              {item.children!.map((child) => (
                <Link
                  key={child.href}
                  href={child.href}
                  role="menuitem"
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
            </NavDropdownPanel>
          </div>
        );
      })}
    </nav>
  );
}

export function V21DesktopNav({ mainMenu }: { mainMenu: NavItem[] }) {
  return <HeaderNavigation mainMenu={mainMenu} />;
}
