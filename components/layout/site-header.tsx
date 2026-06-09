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
 * NEJM-plus site header — logo scaling v23.2.8
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
      <div className="mx-auto flex max-w-[1440px] flex-col px-4 py-[14px] sm:px-6 sm:py-4 md:flex-row md:items-center md:justify-between md:px-8 lg:min-h-[96px] lg:px-10 lg:py-0 xl:min-h-[100px] xl:px-10">
        {/* Mobile: 3-col grid — empty | logo center | hamburger */}
        <div className="grid w-full grid-cols-[1fr_auto_1fr] items-center md:w-auto md:flex md:shrink-0">
          <div className="md:hidden" aria-hidden />
          <HeaderLogo
            centered
            className="col-start-2 justify-self-center md:col-start-auto md:justify-self-start md:items-start md:text-left"
          />
          <div className="col-start-3 flex justify-end md:hidden">
            <V20MobileNav mainMenu={mainMenu} categories={categories} />
          </div>
        </div>

        {/* Tablet+ navigation */}
        <div className="hidden flex-1 items-center justify-end px-2 md:flex lg:justify-center lg:px-6">
          <HeaderNavigation mainMenu={mainMenu} />
        </div>

        {/* Desktop utilities — icons only here, not in nav */}
        <div className="hidden shrink-0 items-center gap-2 md:flex">
          <SearchCommand isVip={isVip} accessLevel={accessLevel} />
          <ThemeToggle />
          <Button
            asChild
            size="sm"
            variant="ghost"
            className="hidden rounded-sm px-[18px] text-[15px] font-normal tracking-[0.2px] text-slate-800 hover:text-[#0055CC] hover:underline lg:inline-flex dark:text-[#E0E0E0] dark:hover:text-[#7CC4FF]"
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

export { SiteHeader as Header };
