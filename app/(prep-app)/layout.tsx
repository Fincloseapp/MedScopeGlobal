import type { ReactNode } from "react";
import { AppOriginBar } from "@/components/apps/app-origin-bar";

export default function PrepAppGroupLayout({ children }: { children: ReactNode }) {
  // Single viewport shell: origin bar + app must share one 100dvh flex column.
  // Nested h-[100dvh] under AppOriginBar clips the bottom tab bar off-screen.
  return (
    <div className="flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden bg-[#0A192F] text-white antialiased">
      <AppOriginBar appName="MeDiprep" />
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</div>
    </div>
  );
}
