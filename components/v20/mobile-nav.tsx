"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { Category } from "@/types/database";
import { HeaderLogo, HEADER_TAGLINE } from "@/components/layout/header-logo";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import type { NavItem } from "@/lib/config/main-navigation";
import { getHeaderUtilityLinks, headerUtilityAria } from "@/lib/config/main-navigation";
import { getSurfaceCopy, isCzechSurface } from "@/lib/i18n/surface-copy";
import { getMagazineListingCopy } from "@/lib/brand/magazine";
import { getPortalChrome } from "@/lib/v271/portal";
import { isStudentChromePath, studentNavCtaLabel } from "@/lib/studenti/pricing";
import { localizePublicHref } from "@/lib/i18n/nav-copy";
import { normalizeLocale } from "@/lib/i18n/config";

export function V20MobileNav({
  mainMenu,
  categories,
  locale = "cs",
}: {
  mainMenu: NavItem[];
  categories: Category[];
  locale?: string;
}) {
  const pathname = usePathname() ?? "";
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    setOpen(false);
    setExpanded(null);
  }, [pathname]);

  const isActive = (href: string) =>
    href === "/" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  const topCategories = categories.slice(0, 8);
  const navLocale = normalizeLocale(locale);
  const surface = getSurfaceCopy(navLocale);
  const chrome = getPortalChrome(navLocale);
  const utilities = getHeaderUtilityLinks(navLocale);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="md:hidden touch-manipulation border-black/[0.06] dark:border-white/10"
          aria-label={surface.menuOpen}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="flex w-[min(100vw-1rem,380px)] flex-col overflow-y-auto overscroll-contain pb-[env(safe-area-inset-bottom)]"
      >
        <SheetHeader className="shrink-0 text-left">
          <HeaderLogo locale={locale} className="mb-2 items-start" />
          <SheetTitle className="font-display text-lg text-[#021d33] dark:text-[#E0E0E0]">
            {HEADER_TAGLINE}
          </SheetTitle>
        </SheetHeader>

        <nav className="mt-4 flex-1 space-y-2" aria-label={surface.menuOpen}>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#005B96]">
              {headerUtilityAria(navLocale)}
            </p>
            <div className="mt-2 grid grid-cols-2 gap-1.5">
              {utilities.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg bg-white px-2 py-2 text-center text-[11px] font-semibold text-[#021d33]"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-[#005B96]/20 bg-[#f4f9fc] p-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#005B96]">{surface.footer.apps}</p>
            <div className="mt-2 grid grid-cols-2 gap-1.5">
              <Link
                href={localizePublicHref("/app/mediflow", navLocale)}
                onClick={() => setOpen(false)}
                className="rounded-lg bg-white px-2 py-2 text-center text-[11px] font-semibold text-[#021d33]"
              >
                MediFlow
              </Link>
              <Link
                href={localizePublicHref("/app/pacient", navLocale)}
                onClick={() => setOpen(false)}
                className="rounded-lg bg-white px-2 py-2 text-center text-[11px] font-semibold text-[#021d33]"
              >
                MeDipacient
              </Link>
              <Link
                href={localizePublicHref("/app/dokumentace", navLocale)}
                onClick={() => setOpen(false)}
                className="rounded-lg bg-white px-2 py-2 text-center text-[11px] font-semibold text-[#021d33]"
              >
                OrdiZapis
              </Link>
              {isCzechSurface(navLocale) ? (
                <Link
                  href="/app/priprava"
                  onClick={() => setOpen(false)}
                  className="rounded-lg bg-slate-50 px-2 py-2 text-center text-[10px] font-medium text-slate-600"
                >
                  MeDiprep
                </Link>
              ) : null}
            </div>
          </div>
          {mainMenu.map((item) => {
            const hasChildren = Boolean(item.children?.length);
            const isExpanded = expanded === item.label;
            return (
              <div key={item.label} className="rounded-xl border border-slate-200 p-3">
                <div className="flex items-center justify-between gap-2">
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`flex-1 text-sm font-semibold ${isActive(item.href) ? "text-primary" : "text-[#021d33]"}`}
                  >
                    {item.label}
                  </Link>
                  {hasChildren && (
                    <button
                      type="button"
                      aria-expanded={isExpanded}
                      aria-label={`${surface.expandMenu} ${item.label}`}
                      className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
                      onClick={() => setExpanded(isExpanded ? null : item.label)}
                    >
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                      />
                    </button>
                  )}
                </div>
                {hasChildren && isExpanded && (
                  <div className="mt-2 space-y-1 border-t border-slate-100 pt-2">
                    {item.children!.map((child) => (
                      <Link
                        key={`${child.href}-${child.label}`}
                        href={child.href}
                        onClick={() => setOpen(false)}
                        className={`block rounded-lg px-2 py-2 text-sm ${pathname === child.href ? "bg-primary/10 font-medium text-primary" : "text-slate-600"}`}
                      >
                        <span className="block font-medium">{child.label}</span>
                        {child.description ? (
                          <span className="mt-0.5 block text-xs font-normal leading-5 text-slate-500">
                            {child.description}
                          </span>
                        ) : null}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {topCategories.length > 0 && (
            <div className="rounded-xl border border-slate-200 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                {getMagazineListingCopy(locale).desksLabel}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {topCategories.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={localizePublicHref(`/category/${cat.slug}`, navLocale)}
                    onClick={() => setOpen(false)}
                    className="rounded-full border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 hover:border-primary/40 hover:text-primary"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </nav>

        <div className="mt-4 shrink-0 flex flex-col gap-2 border-t border-slate-200 pt-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#005B96]">
              {surface.language}
            </p>
            <LocaleSwitcher currentLocale={navLocale} />
          </div>
          <Button asChild className="rounded-full bg-primary touch-manipulation">
            <Link
              href={
                isStudentChromePath(pathname)
                  ? localizePublicHref("/predplatne#student", navLocale)
                  : localizePublicHref("/predplatne?trial=1", navLocale)
              }
              onClick={() => setOpen(false)}
            >
              {isStudentChromePath(pathname) ? studentNavCtaLabel(navLocale) : chrome.trialCta}
            </Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full touch-manipulation">
            <Link href={localizePublicHref("/aplikace", navLocale)} onClick={() => setOpen(false)}>
              {surface.downloadApps}
            </Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full touch-manipulation">
            <Link href={localizePublicHref("/login", navLocale)} onClick={() => setOpen(false)}>
              {surface.signIn}
            </Link>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
