"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MedScopeLogo } from "@/components/brand/medscope-logo";
import { ADMIN_NAV_ITEMS } from "@/components/admin/admin-nav-config";
import { cn } from "@/lib/utils";

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r bg-white lg:block">
      <div className="flex h-16 items-center border-b px-4">
        <MedScopeLogo href="/admin" width={150} height={36} imageClassName="max-h-9" />
      </div>
      <nav className="space-y-1 p-4">
        {ADMIN_NAV_ITEMS.map((link) => {
          const Icon = link.icon;
          const active =
            link.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="px-4 pb-6 text-xs text-muted-foreground">
        Every save writes an immutable audit entry to <code>logs</code>.
      </div>
    </aside>
  );
}
