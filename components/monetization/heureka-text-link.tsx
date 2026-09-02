import Script from "next/script";
import {
  HEUREKA_CZ_TEXT_LINK,
  HEUREKA_TRIXAM_SCRIPT,
} from "@/lib/monetization/heureka-affiliate";

/** Official HEU2 Trixam text link. Do not change class or data-trixam-positionid. */
export function HeurekaTextLink({ className }: { className?: string }) {
  return (
    <span className={className}>
      <Script src={HEUREKA_TRIXAM_SCRIPT} strategy="afterInteractive" />
      <a
        href={HEUREKA_CZ_TEXT_LINK.href}
        className={HEUREKA_CZ_TEXT_LINK.className}
        data-trixam-positionid={HEUREKA_CZ_TEXT_LINK.positionId}
        target="_blank"
        rel="sponsored noopener noreferrer"
      >
        {HEUREKA_CZ_TEXT_LINK.label}
      </a>
    </span>
  );
}

export function shouldShowHeurekaTextLink(locale: string): boolean {
  const key = locale.toLowerCase();
  return key === "cs" || key.startsWith("cs-");
}
