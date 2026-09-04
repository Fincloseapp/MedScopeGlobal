"use client";

import { usePathname } from "next/navigation";
import type { AppUser, Category } from "@/types/database";
import { NotificationBell } from "@/components/layout/notification-bell";
import { SearchCommand } from "@/components/layout/search-command";
import { UserMenu } from "@/components/layout/user-menu";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { V20MobileNav } from "@/components/v20/mobile-nav";
import { HeaderLogo } from "@/components/layout/header-logo";
import { HeaderNavigation } from "@/components/layout/header-navigation";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { NavSubscribeCta } from "@/components/v38/nav-subscribe-cta";
import { MAGAZINE } from "@/lib/brand/magazine";
import type { AccessLevelId } from "@/lib/config/access-levels";
import { getDesktopHeaderMenu, getMobileMenu } from "@/lib/config/main-navigation";
import { normalizeLocale } from "@/lib/i18n/config";
import { localizePublicHref } from "@/lib/i18n/nav-copy";
import { getPortalChrome } from "@/lib/v271/portal";
import { isStudentChromePath, studentNavCtaLabel } from "@/lib/studenti/pricing";

/** v38 — sticky header, compact nav, subscribe CTA for non-VIP */
export function SiteHeader({
  categories,
  locale,
  region: _region,
  user,
  profile,
  isVip,
  accessLevel,
  studentSurface,
}: {
  categories: Category[];
  locale: string;
  region: string;
  user: { id: string; email?: string | null } | null;
  profile: AppUser | null;
  isVip: boolean;
  accessLevel: AccessLevelId;
  studentSurface?: boolean;
}) {
  const pathname = usePathname();
  const navLocale = normalizeLocale(locale);
  const desktopMenu = getDesktopHeaderMenu(navLocale);
  const mobileMenu = getMobileMenu(navLocale);
  const studentChrome = studentSurface ?? isStudentChromePath(pathname);
  const subscribeHref = localizePublicHref(
    studentChrome ? "/predplatne#student" : "/predplatne?trial=1",
    navLocale
  );
  const subscribeLabel = studentChrome
    ? studentNavCtaLabel(navLocale)
    : getPortalChrome(navLocale).trialCta;

  return (
    <header className="site-header sticky top-0 z-50 w-full overflow-visible border-b border-black/[0.06] bg-white/[0.98] backdrop-blur supports-[padding:max(0px)]:pt-[env(safe-area-inset-top)] dark:border-white/[0.08] dark:bg-slate-950/[0.98]">
      <div className="mx-auto grid h-[4.5rem] max-w-[1680px] grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 md:hidden">
        <div aria-hidden />
        <HeaderLogo centered locale={navLocale} className="max-w-[min(52vw,180px)] shrink-0" />
        <div className="flex justify-end">
          <V20MobileNav mainMenu={mobileMenu} categories={categories} locale={locale} />
        </div>
      </div>

      <div className="mx-auto hidden h-16 max-w-[1680px] items-center gap-3 px-4 md:flex lg:gap-4 lg:px-6">
        <div className="flex shrink-0 items-center gap-3">
          <HeaderLogo locale={navLocale} className="max-w-[min(28vw,168px)] shrink-0 lg:max-w-[200px]" />
          <div className="hidden min-w-0 border-l border-black/10 pl-3 dark:border-white/10 lg:block">
            <p className="font-display text-[15px] font-semibold tracking-[0.02em] text-[#021d33] dark:text-slate-100">
              {MAGAZINE.name}
            </p>
            <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-[#005B96]">
              Live well, longer
            </p>
          </div>
        </div>

        <div className="flex min-w-0 flex-1 items-center justify-end gap-2 lg:gap-3">
          <HeaderNavigation mainMenu={desktopMenu} locale={locale} />

          <div className="flex shrink-0 items-center gap-1 border-l border-black/[0.06] pl-2 dark:border-white/10 lg:gap-1.5 lg:pl-3">
            <LocaleSwitcher currentLocale={locale} compact />
            {!isVip ? (
              <NavSubscribeCta
                compact
                className="hidden lg:inline-flex"
                label={subscribeLabel}
                href={subscribeHref}
              />
            ) : null}
            <SearchCommand isVip={isVip} accessLevel={accessLevel} locale={locale} />
            <ThemeToggle />
            {user ? <NotificationBell /> : null}
            <UserMenu user={user} profile={profile} locale={locale} />
          </div>
        </div>
      </div>
    </header>
  );
}

export { SiteHeader as Header };
