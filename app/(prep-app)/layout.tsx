import type { ReactNode } from "react";
import { AppOriginBar } from "@/components/apps/app-origin-bar";

export default function PrepAppGroupLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-[#0A192F] text-white antialiased">
      <AppOriginBar appName="MeDiprep" />
      {children}
    </div>
  );
}
