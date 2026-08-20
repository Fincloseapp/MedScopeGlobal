import type { ReactNode } from "react";
import { AppOriginBar } from "@/components/apps/app-origin-bar";

export default function PacientAppGroupLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[100dvh] bg-[#021d33] text-white antialiased">
      <AppOriginBar appName="MeDipacient" />
      {children}
    </div>
  );
}
