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
import { getDesktopHeaderMenu, getMobileMenu } from "@/lib/config/main-navigation";

/** v33 — sticky h-16 header, compact desktop nav, full mobile drawer */
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
  const desktopMenu = getDesktopHeaderMenu("cs");
  const mobileMenu = getMobileMenu("cs");

  return (
    <header className="site-header sticky top-0 z-50 w-full overflow-visible border-b border-black/[0.06] bg-white/[0.98] backdrop-blur supports-[padding:max(0px)]:pt-[env(safe-area-inset-top)] dark:border-white/[0.08] dark:bg-slate-950/[0.98]">
      <div className="mx-auto grid h-16 max-w-[1680px] grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 md:hidden">
        <div aria-hidden />
        <HeaderLogo centered className="max-w-[min(52vw,180px)] shrink-0" />
        <div className="flex justify-end">
          <V20MobileNav mainMenu={mobileMenu} categories={categories} />
        </div>
      </div>

      <div className="mx-auto hidden h-16 max-w-[1680px] items-center gap-3 px-4 md:flex lg:gap-4 lg:px-6">
        <HeaderLogo className="max-w-[min(28vw,168px)] shrink-0 lg:max-w-[200px]" />

        <div className="flex min-w-0 flex-1 items-center justify-end gap-2 lg:gap-3">
          <HeaderNavigation mainMenu={desktopMenu} />

          <div className="flex shrink-0 items-center gap-1 border-l border-black/[0.06] pl-2 dark:border-white/10 lg:gap-1.5 lg:pl-3">
            <SearchCommand isVip={isVip} accessLevel={accessLevel} />
            <ThemeToggle />
            {user ? <NotificationBell /> : null}
            <UserMenu user={user} profile={profile} />
          </div>
        </div>
      </div>
    </header>
  );
}

export { SiteHeader as Header };
