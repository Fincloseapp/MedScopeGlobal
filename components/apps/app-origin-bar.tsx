import Link from "next/link";
import { MAGAZINE } from "@/lib/brand/magazine";
import { MEDSCOPE_LOGO_ALT } from "@/lib/brand/logo";

/** Persistent origin bar inside app shells — always points back to the magazine. */
export function AppOriginBar({ appName }: { appName: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-black/35 px-3 py-2 text-[11px] text-white/85">
      <a
        href="https://medscopeglobal.com"
        className="flex min-w-0 items-center gap-2 hover:text-white"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/logo/Logo_Negative.webp"
          alt={MEDSCOPE_LOGO_ALT}
          className="h-8 w-auto max-w-[140px] object-contain"
        />
        <span className="truncate font-semibold tracking-wide">medscopeglobal.com</span>
      </a>
      <span className="shrink-0 text-white/60">{appName}</span>
    </div>
  );
}

export function isStandaloneAppHref(href: string): boolean {
  return (
    href.startsWith("/app/pacient") ||
    href.startsWith("/app/priprava") ||
    href.startsWith("/app/dokumentace")
  );
}

/** Opens standalone app shells in the same tab so full chrome (tabs / panels) stays visible. */
export function AppOpenLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

export function MagazineHomeLink({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`text-sm font-semibold text-[#005B96] hover:underline ${className}`}>
      ← {MAGAZINE.name}
    </Link>
  );
}
