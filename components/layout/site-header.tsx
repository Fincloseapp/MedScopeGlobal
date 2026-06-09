"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { AppUser, Category } from "@/types/database";
import { NotificationBell } from "@/components/layout/notification-bell";
import { SearchCommand } from "@/components/layout/search-command";
import { UserMenu } from "@/components/layout/user-menu";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { V20MobileNav } from "@/components/v20/mobile-nav";
import { V21DesktopNav } from "@/components/v21/desktop-nav";
import { MedScopeLogo } from "@/components/brand/medscope-logo";
import { V22HomeLink } from "@/components/v22/home-link";
import type { AccessLevelId } from "@/lib/config/access-levels";
import { getMainMenu } from "@/lib/config/main-navigation";

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
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur supports-[padding:max(0px)]:pt-[env(safe-area-inset-top)] dark:border-slate-800 dark:bg-slate-950/95">
      <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center gap-2 px-4 sm:gap-3 sm:px-6">
        <V22HomeLink />
        <MedScopeLogo href="/" preset="header" priority />

        <V21DesktopNav mainMenu={mainMenu} />

        <div className="ml-auto flex items-center gap-2">
          <SearchCommand isVip={isVip} accessLevel={accessLevel} />
          <ThemeToggle />
          <Button asChild size="sm" className="hidden rounded-full md:flex">
            <Link href="/subscribe" prefetch>
              Předplatné
            </Link>
          </Button>
          {user && <NotificationBell />}
          <UserMenu user={user} profile={profile} />
          <V20MobileNav mainMenu={mainMenu} categories={categories} />
        </div>
      </div>
    </header>
  );
}
