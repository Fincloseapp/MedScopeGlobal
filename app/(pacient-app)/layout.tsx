import type { ReactNode } from "react";
import { AppOriginBar } from "@/components/apps/app-origin-bar";

export default function PacientAppGroupLayout({ children }: { children: ReactNode }) {
  // Single viewport shell — nested h-[100dvh] under AppOriginBar clips bottom chrome.
  return (
    <div className="flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden bg-[#021d33] text-white antialiased">
      <AppOriginBar appName="MeDipacient" />
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</div>
    </div>
  );
}
