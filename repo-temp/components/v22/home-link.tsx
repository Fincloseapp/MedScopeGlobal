"use client";

import Link from "next/link";
import { Home } from "lucide-react";

/** Viditelná ikona Domů — vlevo v headeru, okamžitá odezva, prefetch */
export function V22HomeLink() {
  return (
    <Link
      href="/"
      prefetch
      aria-label="Domů — přejít na úvodní stránku"
      title="Domů"
      className="group relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md ring-2 ring-primary/20 transition-all duration-150 hover:scale-105 hover:bg-primary/90 hover:shadow-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40 active:scale-95 touch-manipulation sm:h-12 sm:w-12"
    >
      <Home
        className="h-5 w-5 transition-transform duration-150 group-hover:-translate-y-0.5 sm:h-6 sm:w-6"
        strokeWidth={2.5}
        aria-hidden
      />
      <span className="sr-only">Domů</span>
    </Link>
  );
}
