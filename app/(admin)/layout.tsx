import Link from "next/link";
import { redirect } from "next/navigation";
import { MedScopeLogo } from "@/components/brand/medscope-logo";
import { AdminMobileNav } from "@/components/admin/admin-mobile-nav";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { isAdminGateOpen } from "@/lib/auth/admin-gate";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const gateOpen = await isAdminGateOpen();
  if (!gateOpen) {
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-screen bg-muted/40">
      <AdminSidebar />
      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex h-14 items-center justify-between gap-3 border-b bg-white px-4 lg:hidden">
          <div className="flex items-center gap-2">
            <AdminMobileNav />
            <MedScopeLogo href="/admin" width={120} height={30} imageClassName="max-h-8" />
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/">View site</Link>
          </Button>
        </header>
        <div className="flex flex-1 justify-center px-4 py-8 sm:px-6 lg:ml-0">
          <div className="w-full max-w-6xl">{children}</div>
        </div>
      </div>
    </div>
  );
}
