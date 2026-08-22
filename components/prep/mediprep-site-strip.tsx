"use client";

import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import { MedScopeLogo } from "@/components/brand/medscope-logo";
import { MEDIPREP } from "@/lib/prep/branding";
import { isMeDiprepStandalone } from "@/components/prep/use-mediprep-pwa";

/**
 * Slim exit hatch from the MeDiprep app to the rest of medscopeglobal.com.
 * Native <a> (not next/link) so PWA navigations leave scope `/app/priprava`
 * and open in the browser instead of staying inside the standalone window.
 */
const SITE_LINKS: readonly { href: string; label: string; hideOnXs?: boolean }[] = [
  { href: "/", label: "Domů" },
  { href: "/verejnost", label: "Veřejnost", hideOnXs: true },
  { href: "/studenti", label: "Studenti" },
  { href: "/lekari", label: "Lékaři", hideOnXs: true },
  { href: MEDIPREP.routes.marketing, label: "MeDiprep" },
  { href: "/predplatne", label: "Předplatné" },
];

export function MeDiprepSiteStrip() {
  const [standalone, setStandalone] = useState(false);

  useEffect(() => {
    const sync = () => setStandalone(isMeDiprepStandalone());
    sync();
    const mq = window.matchMedia("(display-mode: standalone)");
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return (
    <nav
      aria-label="Web MedScopeGlobal"
      data-standalone={standalone ? "true" : undefined}
      className="group/site shrink-0 border-b border-white/10 bg-[#0A192F] text-white"
    >
      <div className="mx-auto flex h-8 max-w-3xl items-center gap-2 px-3 sm:h-9 sm:px-4 group-data-[standalone=true]/site:h-7 [@media(display-mode:standalone)]:h-7 [@media(display-mode:window-controls-overlay)]:h-7">
        <a
          href="/"
          className="inline-flex min-w-0 shrink-0 items-center gap-1.5 text-[11px] font-semibold tracking-wide text-white hover:text-[#A3E635]"
          aria-label="MedScopeGlobal — domů"
        >
          <MedScopeLogo
            href=""
            variant="negative"
            width={120}
            height={20}
            className="p-0"
            imageClassName="h-4 w-auto max-w-[112px] object-contain sm:h-[18px] sm:max-w-[128px]"
          />
          <span className="hidden items-center gap-1 font-medium text-[#A3E635] group-data-[standalone=true]/site:inline-flex [@media(display-mode:standalone)]:inline-flex [@media(display-mode:window-controls-overlay)]:inline-flex">
            Web MedScopeGlobal
            <ExternalLink className="h-3 w-3" aria-hidden />
          </span>
        </a>

        <ul className="ml-auto flex min-w-0 items-center gap-0.5 overflow-x-auto text-[11px] font-medium sm:gap-1 group-data-[standalone=true]/site:hidden [@media(display-mode:standalone)]:hidden [@media(display-mode:window-controls-overlay)]:hidden">
          {SITE_LINKS.map((link) => (
            <li key={`${link.href}-${link.label}`} className={"hideOnXs" in link && link.hideOnXs ? "hidden sm:block" : undefined}>
              <a
                href={link.href}
                className="whitespace-nowrap rounded-md px-1.5 py-1 text-white/80 hover:bg-white/10 hover:text-[#A3E635]"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
