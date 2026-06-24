"use client";

import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/layout/site-header";
import { SubscriptionNudgeStrip } from "@/components/v38/subscription-nudge-strip";
import type { AppUser, Category } from "@/types/database";
import type { AccessLevelId } from "@/lib/config/access-levels";
import type { StoredNudge } from "@/lib/v38/conversion-engine";
import { getStaticCopy } from "@/lib/v38/conversion-copy";

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

    if (!navStripCopy) {
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
  }, [navStripCopy]);

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
      {!reader.isVip ? <SubscriptionNudgeStrip copy={stripCopy} /> : null}
    </>
  );
}
