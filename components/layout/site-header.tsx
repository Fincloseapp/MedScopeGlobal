"use client";

import Link from "next/link";
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
import type { AccessLevelId } from "@/lib/config/access-levels";
import {
  getDesktopHeaderMenu,
  getHeaderUtilityLinks,
  getMobileMenu,
  headerUtilityAria,
} from "@/lib/config/main-navigation";
import { normalizeLocale } from "@/lib/i18n/config";
import { localizePublicHref } from "@/lib/i18n/nav-copy";
import { getPortalChrome } from "@/lib/v271/portal";
import { isStudentChromePath, studentNavCtaLabel } from "@/lib/studenti/pricing";

/** Two-row sticky header: full utility strip + brand/primary IA, no hidden overflow. */
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
  const utilities = getHeaderUtilityLinks(navLocale);
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
      <div className="mx-auto grid h-[4.5rem] max-w-[1680px] grid-cols-[1fr_auto_1fr] items-center gap-2 px-4 md:hidden">
        <div className="flex justify-start">
          {!isVip ? (
            <NavSubscribeCta
              compact
              className="max-[360px]:px-2 max-[360px]:text-[10px]"
              label={subscribeLabel}
              href={subscribeHref}
            />
          ) : null}
        </div>
        <HeaderLogo centered locale={navLocale} className="max-w-[min(52vw,180px)] shrink-0" />
        <div className="flex justify-end">
          <V20MobileNav mainMenu={mobileMenu} categories={categories} locale={locale} />
        </div>
      </div>

      <div className="mx-auto hidden max-w-[1680px] md:block">
        <div className="flex min-h-11 items-center gap-3 border-b border-black/[0.04] bg-slate-50/80 px-4 dark:border-white/10 dark:bg-white/[0.03] lg:px-6">
          <nav
            className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-1"
            aria-label={headerUtilityAria(navLocale)}
            data-nav="utility"
          >
            {utilities.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="whitespace-nowrap text-xs font-medium text-slate-500 transition hover:text-[#005B96] dark:text-slate-400"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-1 lg:gap-1.5">
            <LocaleSwitcher currentLocale={locale} compact />
            {!isVip ? (
              <NavSubscribeCta compact label={subscribeLabel} href={subscribeHref} />
            ) : null}
            <SearchCommand isVip={isVip} accessLevel={accessLevel} locale={locale} />
            <ThemeToggle />
            {user ? <NotificationBell /> : null}
            <UserMenu user={user} profile={profile} locale={locale} />
          </div>
        </div>

        <div className="flex items-start gap-3 px-4 py-1.5 lg:items-center lg:px-6">
          <HeaderLogo locale={navLocale} className="mt-0.5 max-w-[150px] shrink-0 lg:max-w-[188px]" />
          <div className="min-w-0 flex-1">
            <HeaderNavigation mainMenu={desktopMenu} locale={locale} />
          </div>
        </div>
      </div>
    </header>
  );
}

export { SiteHeader as Header };
