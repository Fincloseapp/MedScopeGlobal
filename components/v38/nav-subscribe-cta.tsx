"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  label?: string;
  href?: string;
  className?: string;
  compact?: boolean;
};

/** v38 — compact subscribe pill in main navbar for non-VIP users */
export function NavSubscribeCta({
  label = "Předplatné",
  href = "/predplatne",
  className,
  compact = false,
}: Props) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full font-semibold transition",
        "bg-[#005B96] text-white shadow-sm hover:bg-[#004a7a]",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#005B96]",
        compact ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-sm",
        className
      )}
    >
      <Sparkles className={compact ? "h-3 w-3" : "h-3.5 w-3.5"} aria-hidden />
      {label}
    </Link>
  );
}
