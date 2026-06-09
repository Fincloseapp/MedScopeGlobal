"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { AppUser, Category } from "@/types/database";
import { NotificationBell } from "@/components/layout/notification-bell";
import { SearchCommand } from "@/components/layout/search-command";
import { UserMenu } from "@/components/layout/user-menu";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { V20MobileNav } from "@/components/v20/mobile-nav";
import { HeaderLogo } from "@/components/layout/header-logo";
import { HeaderNavigation } from "@/components/layout/header-navigation";
import type { AccessLevelId } from "@/lib/config/access-levels";
import { getMainMenu } from "@/lib/config/main-navigation";

/**
 * NEJM / Lancet / BMJ — level site header (v23.2.6)
 */
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
  const mainMenu = getMainMenu("cs");

  return (
    <header className="site-header sticky top-0 z-50 w-full border-b border-black/[0.08] bg-white/98 backdrop-blur supports-[padding:max(0px)]:pt-[env(safe-area-inset-top)] dark:border-white/10 dark:bg-slate-950/98">
      <div className="mx-auto max-w-[1400px] px-4 py-3 sm:px-6 md:px-8 lg:flex lg:min-h-[84px] lg:items-center lg:justify-between lg:py-0 xl:min-h-[96px]">
        {/* Mobile: centered logo | Desktop: logo left */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 lg:flex lg:shrink-0 lg:items-center">
          <div className="hidden lg:block" aria-hidden />
          <HeaderLogo centered className="col-start-2 lg:col-start-auto lg:items-start lg:text-left" />
          <div className="col-start-3 flex items-center justify-end gap-1.5 sm:gap-2 lg:hidden">
            <SearchCommand isVip={isVip} accessLevel={accessLevel} />
            <ThemeToggle />
            <V20MobileNav mainMenu={mainMenu} categories={categories} />
          </div>
        </div>

        {/* Desktop navigation — center/right */}
        <div className="hidden flex-1 items-center justify-center px-4 lg:flex xl:justify-end xl:pr-6">
          <HeaderNavigation mainMenu={mainMenu} />
        </div>

        {/* Desktop actions */}
        <div className="hidden items-center gap-2 lg:flex lg:shrink-0">
          <SearchCommand isVip={isVip} accessLevel={accessLevel} />
          <ThemeToggle />
          <Button
            asChild
            size="sm"
            variant="outline"
            className="hidden rounded-sm border-slate-300 font-normal tracking-[0.2px] xl:inline-flex"
          >
            <Link href="/subscribe" prefetch>
              Předplatné
            </Link>
          </Button>
          {user ? <NotificationBell /> : null}
          <UserMenu user={user} profile={profile} />
        </div>
      </div>
    </header>
  );
}

/** Alias per v23.2.6 spec */
export { SiteHeader as Header };
