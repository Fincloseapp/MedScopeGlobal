"use client";

import { useEffect } from "react";
import { ensureMeDipacientServiceWorker } from "@/components/medipacient/use-medipacient-pwa";

/** Registers the MeDipacient service worker on marketing + download pages so the PWA is installable. */
export function MeDipacientPwaRegister() {
  useEffect(() => {
    void ensureMeDipacientServiceWorker();
  }, []);
  return null;
}
