"use client";

import { useEffect } from "react";
import { ensureMediktorServiceWorker } from "@/components/lekari/dok-app/use-mediktor-pwa";

/** Registers the MeDiktor service worker on marketing + download pages so the PWA is installable. */
export function MediktorPwaRegister() {
  useEffect(() => {
    void ensureMediktorServiceWorker();
  }, []);
  return null;
}
