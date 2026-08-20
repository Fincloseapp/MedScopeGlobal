import type { ReactNode } from "react";
import { AppOriginBar } from "@/components/apps/app-origin-bar";

/** Minimal shell for MeDiktor app (MedScopeGlobal) — no SiteHeader/SiteFooter. */
export default function DokAppGroupLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[100dvh] bg-[#021d33] text-white antialiased">
      <AppOriginBar appName="MeDiktor" />
      {children}
    </div>
  );
}
