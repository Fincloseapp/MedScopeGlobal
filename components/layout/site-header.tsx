"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AppUser, Category } from "@/types/database";
import { NotificationBell } from "@/components/layout/notification-bell";
import { SearchCommand } from "@/components/layout/search-command";
import { UserMenu } from "@/components/layout/user-menu";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { V20MobileNav } from "@/components/v20/mobile-nav";
import type { AccessLevelId } from "@/lib/config/access-levels";
import { getHeaderTagline, getMainMenu } from "@/lib/config/main-navigation";

export function SiteHeader({
  categories,
  locale: _locale,
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
  const mainMenu = getMainMenu("cs");
  const tagline = getHeaderTagline("cs");

  const hasActiveParent = (href: string) =>
    href === "/" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  const isActiveChild = (href: string) => pathname === href;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur supports-[padding:max(0px)]:pt-[env(safe-area-inset-top)]">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
        <Link href="/" className="flex min-w-0 items-center gap-2">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Activity className="h-5 w-5" aria-hidden />
          </span>
          <span className="hidden min-w-0 flex-col sm:flex">
            <span className="truncate font-display text-base font-semibold text-[#021d33]">
              MedScopeGlobal
            </span>
            <span className="-mt-0.5 truncate text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              {tagline}
            </span>
          </span>
        </Link>

        <nav
          className="hidden flex-1 items-center justify-center xl:flex"
          aria-label="Hlavní navigace"
        >
          {mainMenu.map((item) => (
            <div key={item.label} className="relative px-1">
              {item.children ? (
                <details className="group/details relative">
                  <summary
                    className={`flex cursor-pointer list-none items-center gap-1 rounded-full px-2.5 py-2 text-[11px] font-semibold transition hover:bg-slate-50 hover:text-primary ${hasActiveParent(item.href) ? "bg-slate-50 text-primary" : "text-slate-700"}`}
                  >
                    {item.label}
                    <ChevronDown className="h-3.5 w-3.5 text-slate-500" aria-hidden />
                  </summary>
                  <div className="absolute left-0 top-full z-50 mt-2 min-w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={`block rounded-xl px-3 py-2 transition hover:bg-slate-50 hover:text-primary ${isActiveChild(child.href) ? "bg-slate-50 font-semibold text-primary" : "text-slate-700"}`}
                      >
                        <span className="text-sm">{child.label}</span>
                        {child.description && (
                          <span className="mt-0.5 block text-xs text-muted-foreground">
                            {child.description}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                </details>
              ) : (
                <Link
                  href={item.href}
                  className={`rounded-full px-2.5 py-2 text-[11px] font-semibold transition hover:bg-slate-50 hover:text-primary ${hasActiveParent(item.href) ? "bg-slate-50 text-primary" : "text-slate-700"}`}
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
          <Button asChild size="sm" className="hidden rounded-full md:flex">
            <Link href="/subscribe">Předplatné</Link>
          </Button>
          {user && <NotificationBell />}
          <UserMenu user={user} profile={profile} />
          <V20MobileNav mainMenu={mainMenu} categories={categories} />
        </div>
      </div>
    </header>
  );
}
