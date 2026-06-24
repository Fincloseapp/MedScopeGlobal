import Link from "next/link";
import { cn } from "@/lib/utils";
import { SITE } from "@/lib/config/site";

export const HEADER_TAGLINE = "Odborný zdravotnický magazín";

export function HeaderLogo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn("inline-flex flex-col items-start gap-0.5", className)}
    >
      <span className="font-display text-xl font-bold tracking-tight text-[#021d33] dark:text-[#E0E0E0]">
        {SITE.name}
      </span>
    </Link>
  );
}
