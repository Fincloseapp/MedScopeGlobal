"use client";

import Link from "next/link";
import { LogIn, UserRound, CalendarClock, ShieldCheck } from "lucide-react";
import type { AppAccessInfo } from "@/lib/apps/access-status";

type Props = {
  access: AppAccessInfo;
  /** Called when user taps the account chip while already signed in */
  onOpenAccount?: () => void;
  accent?: string;
  className?: string;
  labels?: {
    signIn?: string;
    account?: string;
  };
};

/**
 * Compact account + validity strip under the app header.
 * Always shows who is signed in (or host), plan, and validity / login CTA.
 */
export function AppAccountStatus({
  access,
  onOpenAccount,
  accent = "#C45C26",
  className = "",
  labels,
}: Props) {
  const signIn = labels?.signIn ?? "Přihlášení";
  const account = labels?.account ?? "Účet";
  return (
    <div
      className={`shrink-0 border-b border-slate-200/80 bg-slate-50/95 px-3 py-2 text-[#0A192F] sm:px-4 ${className}`}
      role="status"
      aria-label="Stav účtu a platnost"
    >
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2">
        <div className="min-w-0 flex-1 space-y-0.5">
          <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5 text-xs sm:text-sm">
            <span className="inline-flex items-center gap-1 font-semibold">
              <UserRound className="h-3.5 w-3.5 shrink-0 text-slate-400" />
              <span className="truncate">{access.accountLabel}</span>
            </span>
            {access.email && access.accountLabel !== access.email ? (
              <span className="truncate text-slate-500">{access.email}</span>
            ) : null}
          </div>
          <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-slate-600 sm:text-xs">
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0" style={{ color: accent }} />
              <span>
                Přístup: <strong className="font-semibold text-slate-800">{access.planLabel}</strong>
              </span>
            </span>
            <span className="inline-flex items-center gap-1">
              <CalendarClock className="h-3.5 w-3.5 shrink-0 text-slate-400" />
              <span>
                Platnost: <strong className="font-semibold text-slate-800">{access.validityLabel}</strong>
              </span>
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {!access.authenticated ? (
            <Link
              href={access.loginUrl}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold text-white shadow-sm touch-manipulation"
              style={{ backgroundColor: accent }}
            >
              <LogIn className="h-3.5 w-3.5" />
              {signIn}
            </Link>
          ) : (
            <button
              type="button"
              onClick={onOpenAccount}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 touch-manipulation hover:bg-slate-100"
            >
              <UserRound className="h-3.5 w-3.5" />
              {account}
            </button>
          )}
          {!access.entitled ? (
            <Link
              href={access.subscribeUrl}
              className="hidden rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 touch-manipulation hover:bg-slate-100 sm:inline-flex"
            >
              Předplatné
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
