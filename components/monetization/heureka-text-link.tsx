import Script from "next/script";
import {
  HEUREKA_CZ_TEXT_LINK,
  HEUREKA_TRIXAM_SCRIPT,
} from "@/lib/monetization/heureka-affiliate";

/** Official HEU2 Trixam text link. Visible href stays https://www.heureka.cz/. Do not change class or data-trixam-positionid. */
export function HeurekaTextLink({ className }: { className?: string }) {
  return (
    <span className={className ?? "inline-flex flex-col items-center gap-1"}>
      <Script src={HEUREKA_TRIXAM_SCRIPT} strategy="afterInteractive" />
      <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#005B96]">
        Srovnání cen
      </span>
      <a
        href={HEUREKA_CZ_TEXT_LINK.href}
        className={HEUREKA_CZ_TEXT_LINK.className}
        data-trixam-positionid={HEUREKA_CZ_TEXT_LINK.positionId}
        target="_blank"
        rel="noopener noreferrer"
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
