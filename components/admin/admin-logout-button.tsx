"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function AdminLogoutButton({ className }: { className?: string }) {
  const router = useRouter();

  async function logout() {
    await fetch("/api/v21/admin-gate", { method: "DELETE" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <Button type="button" variant="outline" size="sm" className={className} onClick={logout}>
      Odhlásit
    </Button>
  );
}
