import type { ReactNode } from "react";

/** Minimal shell for MedScope Dokumentace app — no SiteHeader/SiteFooter. */
export default function DokAppGroupLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[100dvh] bg-[#021d33] text-white antialiased">
      {children}
    </div>
  );
}
