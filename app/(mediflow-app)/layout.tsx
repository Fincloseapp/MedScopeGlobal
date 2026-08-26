import type { ReactNode } from "react";
import { AppOriginBar } from "@/components/apps/app-origin-bar";

export default function MediFlowAppGroupLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden bg-[#0a1628] text-white antialiased">
      <AppOriginBar appName="MediFlow" />
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</div>
    </div>
  );
}
