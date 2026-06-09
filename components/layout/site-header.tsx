"use client";

import Link from "next/link";
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
 * v23.2.9 — max logo visibility + full menu on desktop (96px header)
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
    <header className="site-header sticky top-0 z-50 w-full border-b border-black/[0.06] bg-white/[0.98] backdrop-blur supports-[padding:max(0px)]:pt-[env(safe-area-inset-top)] dark:border-white/[0.08] dark:bg-slate-950/[0.98]">
      {/* Mobile */}
      <div className="mx-auto grid max-w-[1600px] grid-cols-[1fr_auto_1fr] items-center px-4 py-3.5 md:hidden">
        <div aria-hidden />
        <HeaderLogo centered />
        <div className="flex justify-end">
          <V20MobileNav mainMenu={mainMenu} categories={categories} />
        </div>
      </div>

      {/* Tablet + Desktop — single row, 96px, full nav visible */}
      <div className="mx-auto hidden h-24 max-w-[1600px] items-center justify-between gap-3 px-8 md:flex">
        <HeaderLogo className="shrink-0" />

        <HeaderNavigation mainMenu={mainMenu} />

        <div className="flex shrink-0 items-center gap-1.5 lg:gap-2">
          <SearchCommand isVip={isVip} accessLevel={accessLevel} />
          <ThemeToggle />
          <Link
            href="/subscribe"
            prefetch
            className="hidden whitespace-nowrap px-4 text-[15.5px] font-normal tracking-[0.2px] text-slate-800 transition-colors hover:text-[#0055CC] hover:underline xl:inline dark:text-[#E0E0E0] dark:hover:text-[#7CC4FF]"
          >
            Předplatné
          </Link>
          {user ? <NotificationBell /> : null}
          <UserMenu user={user} profile={profile} />
        </div>
      </div>
    </header>
  );
}

export { SiteHeader as Header };
