"use client";

import Script from "next/script";
import {
  HEUREKA_CZ_TEXT_LINK,
  HEUREKA_TRIXAM_SCRIPT,
} from "@/lib/monetization/heureka-affiliate";

/**
 * Visible chip stays https://www.heureka.cz/.
 * Trixam must not sit on that <a> — it rewrites href to serve.affiliate.heureka.cz.
 * Official HEU2 class + position 282256 live on a hidden sibling that we click.
 */
export function HeurekaTextLink({ className }: { className?: string }) {
  return (
    <span className={className ?? "relative inline-flex flex-col items-center gap-1"}>
      <Script src={HEUREKA_TRIXAM_SCRIPT} strategy="afterInteractive" />
      <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#005B96]">
        Srovnání cen
      </span>
      <a
        href={HEUREKA_CZ_TEXT_LINK.href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(event) => {
          event.preventDefault();
          const official = document.getElementById("heureka-heu2");
          if (official instanceof HTMLAnchorElement) {
            official.click();
            return;
          }
          window.open(HEUREKA_CZ_TEXT_LINK.href, "_blank", "noopener,noreferrer");
        }}
      >
        {HEUREKA_CZ_TEXT_LINK.label}
      </a>
      <a
        id="heureka-heu2"
        href={HEUREKA_CZ_TEXT_LINK.href}
        className={HEUREKA_CZ_TEXT_LINK.className}
        data-trixam-positionid={HEUREKA_CZ_TEXT_LINK.positionId}
        target="_blank"
        rel="noopener noreferrer"
        tabIndex={-1}
        aria-hidden
        style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}
      />
    </span>
  );
}

export function shouldShowHeurekaTextLink(locale: string): boolean {
  const key = locale.toLowerCase();
  return key === "cs" || key.startsWith("cs-");
}
