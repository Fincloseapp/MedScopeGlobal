import type { ReactNode } from "react";

export default function PacientAppGroupLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-[100dvh] bg-[#021d33] text-white antialiased">{children}</div>;
}
