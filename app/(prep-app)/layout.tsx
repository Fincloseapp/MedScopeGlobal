import type { ReactNode } from "react";

export default function PrepAppGroupLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-[100dvh] bg-[#0A192F] text-white antialiased">{children}</div>;
}
