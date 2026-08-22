import type { ReactNode } from "react";

/** Extra apple-touch-icon without query string — some iOS versions ignore ?v= icons. */
export default function MeDipacientAppLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <link rel="apple-touch-icon" href="/assets/medipacient/apple-touch-icon.png" />
      <link rel="apple-touch-icon-precomposed" href="/assets/medipacient/apple-touch-icon.png" />
      {children}
    </>
  );
}
