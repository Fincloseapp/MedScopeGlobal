"use client";

import { useEffect, useState } from "react";
import { MeDipacientInstallButton } from "@/components/medipacient/medipacient-install-button";
import { MeDipacientPwaRegister } from "@/components/medipacient/medipacient-pwa-register";

/** Registers the PWA and opens the install sheet when ?install=1 (QR / Android). */
export function MeDipacientInstallAuto() {
  const [autoOpen, setAutoOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("install") === "1") setAutoOpen(true);
  }, []);

  return (
    <>
      <MeDipacientPwaRegister />
      <MeDipacientInstallButton variant="hero" autoOpen={autoOpen} />
    </>
  );
}
