"use client";

import Link from "next/link";
import { Home } from "lucide-react";

/** Viditelná ikona Domů — okamžitá odezva, prefetch */
export function V22HomeLink() {
  return (
    <Link
      href="/"
      prefetch
      aria-label="Domů"
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/5 text-primary transition hover:bg-primary hover:text-primary-foreground active:scale-95 touch-manipulation"
    >
      <Home className="h-5 w-5" strokeWidth={2.25} aria-hidden />
    </Link>
  );
}
