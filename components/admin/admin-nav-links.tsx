"use client";

import Link from "next/link";
import { ADMIN_NAV_GROUPS } from "@/components/admin/admin-nav-config";
import { isAdminNavActive } from "@/lib/admin/nav-active";
import { cn } from "@/lib/utils";

export function AdminNavLinks({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="space-y-5">
      {ADMIN_NAV_GROUPS.map((group) => (
        <div key={group.id}>
          <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            {group.label}
          </p>
          <div className="space-y-0.5">
            {group.items.map((link) => {
              const Icon = link.icon;
              const active = isAdminNavActive(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
