"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { SiteHeader } from "@/components/layout/site-header";
import { SubscriptionNudgeStrip } from "@/components/v38/subscription-nudge-strip";
import type { AppUser, Category } from "@/types/database";
import type { AccessLevelId } from "@/lib/config/access-levels";
import type { StoredNudge } from "@/lib/v38/conversion-engine";
import {
  daySeed,
  getStaticCopy,
  getStudentiNavStripCopy,
  getVerejnostNavStripCopy,
  getLekariNavStripCopy,
  isStudentAudiencePath,
  isPublicAudiencePath,
  isPhysicianAudiencePath,
} from "@/lib/v38/conversion-copy";

type ReaderPayload = {
  user: { id: string; email?: string | null } | null;
  profile: AppUser | null;
  isVip: boolean;
  accessLevel: AccessLevelId;
};

const DEFAULT_READER: ReaderPayload = {
  user: null,
  profile: null,
  isVip: false,
  accessLevel: "public",
};

type Props = {
  categories: Category[];
  locale: string;
  region: string;
  navStripCopy?: StoredNudge;
};

/** v38 — header + optional conversion strip for non-VIP */
export function SiteHeaderWithConversion({
  categories,
  locale,
  region,
  navStripCopy,
}: Props) {
  const pathname = usePathname();
  const studentPath = isStudentAudiencePath(pathname);
  const publicPath = isPublicAudiencePath(pathname);
  const physicianPath = isPhysicianAudiencePath(pathname);
  /** Homepage hero owns first viewport — hide competing conversion strip */
  const isMagazineHome = useMemo(() => {
    if (!pathname) return false;
    const p = pathname.replace(/\/$/, "") || "/";
    return (
      p === "/" ||
      p === "/cs" ||
      p === "/en" ||
      /^\/[a-z]{2}(-[a-zA-Z]+)?$/.test(p)
    );
  }, [pathname]);
  const audienceStrip = useMemo(() => {
    if (studentPath) return { ...getStudentiNavStripCopy(daySeed()), generatedBy: "static" as const };
    if (publicPath) return { ...getVerejnostNavStripCopy(), generatedBy: "static" as const };
    if (physicianPath) return { ...getLekariNavStripCopy(), generatedBy: "static" as const };
    return null;
  }, [studentPath, publicPath, physicianPath]);

  const [reader, setReader] = useState<ReaderPayload>(DEFAULT_READER);
  const [stripCopy, setStripCopy] = useState<StoredNudge>(
    navStripCopy ?? { ...getStaticCopy("nav_strip"), generatedBy: "static" }
  );

  useEffect(() => {
    let cancelled = false;
    fetch("/api/v22/reader-context", { credentials: "same-origin" })
      .then((r) => (r.ok ? r.json() : DEFAULT_READER))
      .then((data: ReaderPayload) => {
        if (!cancelled) setReader(data);
      })
      .catch(() => {});

    if (!audienceStrip && !navStripCopy) {
      fetch("/api/v38/conversion-copy?slot=nav_strip")
        .then((r) => (r.ok ? r.json() : null))
        .then((data: StoredNudge | null) => {
          if (!cancelled && data) setStripCopy(data);
        })
        .catch(() => {});
    }

    return () => {
      cancelled = true;
    };
  }, [navStripCopy, audienceStrip]);

  const effectiveStrip = audienceStrip ?? stripCopy;

  return (
    <>
      <SiteHeader
        categories={categories}
        locale={locale}
        region={region}
        user={reader.user}
        profile={reader.profile}
        isVip={reader.isVip}
        accessLevel={reader.accessLevel}
      />
      {!reader.isVip && !isMagazineHome ? (
        <SubscriptionNudgeStrip
          copy={effectiveStrip}
          ctaDataAttr={
            studentPath ? "nav-strip-student-trial" : publicPath ? "nav-strip-public-app" : "nav-strip-trial"
          }
        />
      ) : null}
    </>
  );
}
