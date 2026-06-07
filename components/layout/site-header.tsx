"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, ChevronDown, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import type { AppUser, Category } from "@/types/database";
import { NotificationBell } from "@/components/layout/notification-bell";
import { SearchCommand } from "@/components/layout/search-command";
import { UserMenu } from "@/components/layout/user-menu";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import type { AccessLevelId } from "@/lib/config/access-levels";
import { getHeaderTagline, getMainMenu } from "@/lib/config/main-navigation";
import { normalizeLocale, type LocaleCode } from "@/lib/i18n/config";

export function SiteHeader({
  categories: _categories,
  locale,
  region: _region,
  user,
  profile,
  isVip,
  accessLevel,
}: {
  categories: Category[];
  locale: string;
  region: string;
  user: { id: string; email?: string | null } | null;
  profile: AppUser | null;
  isVip: boolean;
  accessLevel: AccessLevelId;
}) {
  const pathname = usePathname();
  const loc = normalizeLocale(locale) as LocaleCode;
  const mainMenu = getMainMenu(loc);
  const tagline = getHeaderTagline(loc);
  const isCs = loc === "cs";

  const hasActiveParent = (href: string) =>
    href === "/" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  const isActiveChild = (href: string) => pathname === href;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#005B96] text-white">
            <Activity className="h-5 w-5" aria-hidden />
          </span>
          <span className="hidden flex-col sm:flex">
            <span className="font-display text-base font-semibold text-medical-navy">MedScopeGlobal</span>
            <span className="-mt-0.5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{tagline}</span>
          </span>
        </Link>

        <nav className="hidden flex-1 items-center justify-center xl:flex" aria-label={isCs ? "Hlavní navigace" : "Main navigation"}>
          {mainMenu.map((item) => (
            <div key={item.label} className="relative px-1">
              {item.children ? (
                <details className="group/details relative">
                  <summary
                    className={`flex cursor-pointer list-none items-center gap-1 rounded-full px-2.5 py-2 text-[11px] font-semibold transition hover:bg-[#f2f8fd] hover:text-[#005B96] ${hasActiveParent(item.href) ? "bg-[#f2f8fd] text-[#005B96]" : "text-slate-700"}`}
                  >
                    {item.label}
                    <ChevronDown className="h-3.5 w-3.5 text-slate-500" aria-hidden />
                  </summary>
                  <div className="absolute left-0 top-full z-50 mt-2 min-w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_20px_50px_-24px_rgba(0,91,150,0.65)]">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={`block rounded-xl px-3 py-2 transition hover:bg-[#f2f8fd] hover:text-[#005B96] ${isActiveChild(child.href) ? "bg-[#f2f8fd] font-semibold text-[#005B96]" : "text-slate-700"}`}
                      >
                        <span className="text-sm">{child.label}</span>
                        {child.description && (
                          <span className="mt-0.5 block text-xs text-muted-foreground">{child.description}</span>
                        )}
                      </Link>
                    ))}
                  </div>
                </details>
              ) : (
                <Link
                  href={item.href}
                  className={`rounded-full px-2.5 py-2 text-[11px] font-semibold transition hover:bg-[#f2f8fd] hover:text-[#005B96] ${hasActiveParent(item.href) ? "bg-[#f2f8fd] text-[#005B96]" : "text-slate-700"}`}
                >
                  {item.label}
                </Link>
              )}
            </div>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <SearchCommand isVip={isVip} accessLevel={accessLevel} />

          <ThemeToggle />

          <Button asChild size="sm" className="hidden rounded-full bg-[#005B96] text-white hover:bg-[#004874] md:flex">
            <Link href="/subscribe">{isCs ? "Předplatné" : "Subscribe"}</Link>
          </Button>

          {user && <NotificationBell />}

          <UserMenu user={user} profile={profile} />

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="xl:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">{isCs ? "Menu" : "Menu"}</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[320px]">
              <div className="mt-6 space-y-2">
                {mainMenu.map((item) => (
                  <div key={item.label} className="rounded-2xl border border-slate-200 p-3">
                    <Link
                      href={item.href}
                      className={`flex items-center justify-between text-sm font-semibold ${hasActiveParent(item.href) ? "text-[#005B96]" : "text-medical-navy"}`}
                    >
                      <span>{item.label}</span>
                    </Link>
                    {item.children && (
                      <div className="mt-2 space-y-1">
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={`block rounded-xl px-2 py-1.5 text-sm ${isActiveChild(child.href) ? "bg-[#f2f8fd] font-semibold text-[#005B96]" : "text-muted-foreground"}`}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                <div className="mt-2 flex flex-col gap-2">
                  <Link
                    href="/subscribe"
                    className="inline-flex rounded-full bg-[#005B96] px-4 py-2 text-sm font-semibold text-white"
                  >
                    {isCs ? "Předplatné" : "Subscribe"}
                  </Link>
                  <Link
                    href="/signup"
                    className="inline-flex rounded-full border border-[#8dc4ea] px-4 py-2 text-sm font-semibold text-[#005B96]"
                  >
                    {isCs ? "Registrace" : "Sign up"}
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
