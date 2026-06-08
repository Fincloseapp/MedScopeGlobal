"use client";

import Link from "next/link";
import { Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AppUser, Category } from "@/types/database";
import { NotificationBell } from "@/components/layout/notification-bell";
import { SearchCommand } from "@/components/layout/search-command";
import { UserMenu } from "@/components/layout/user-menu";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { V20MobileNav } from "@/components/v20/mobile-nav";
import { V21DesktopNav } from "@/components/v21/desktop-nav";
import { V22HomeLink } from "@/components/v22/home-link";
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
  const mainMenu = getMainMenu("cs");
  const tagline = getHeaderTagline("cs");

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur supports-[padding:max(0px)]:pt-[env(safe-area-inset-top)]">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-2 px-4 sm:gap-3 sm:px-6">
        <V22HomeLink />
        <Link href="/" prefetch className="flex min-w-0 items-center gap-2">
          <span className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground sm:flex">
            <Activity className="h-5 w-5" aria-hidden />
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="truncate font-display text-base font-semibold text-[#021d33]">
              MedScopeGlobal
            </span>
            <span className="-mt-0.5 truncate text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              {tagline}
            </span>
          </span>
        </Link>

        <V21DesktopNav mainMenu={mainMenu} />

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
