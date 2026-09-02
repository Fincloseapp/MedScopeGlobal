"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MedScopeLogo } from "@/components/brand/medscope-logo";
import { AdminLogoutButton } from "@/components/admin/admin-logout-button";
import { AdminNavLinks } from "@/components/admin/admin-nav-links";

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 overflow-y-auto border-r bg-white lg:block">
      <div className="flex h-[4.5rem] items-center border-b px-4">
        <MedScopeLogo href="/admin" preset="admin-sidebar" />
      </div>
      <div className="p-4 pb-8">
        <AdminNavLinks pathname={pathname} />
      </div>
      <div className="border-t px-4 py-4 text-xs text-muted-foreground">
        <div className="flex flex-col gap-2">
          <Link href="/" className="font-medium text-[#005B96] hover:underline">
            Otevřít web
          </Link>
          <AdminLogoutButton className="w-fit" />
        </div>
        <p className="mt-2 leading-relaxed">
          Každá změna se zapisuje do auditu <code>logs</code>.
        </p>
      </div>
    </aside>
  );
}
