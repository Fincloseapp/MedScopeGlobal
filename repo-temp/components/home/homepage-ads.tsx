"use client";

import { useEffect, useState } from "react";
import { AdPlacement } from "@/components/ads/ad-placement";
import type { AdRow } from "@/types/database";

type ReaderPayload = { isVip: boolean };

export function HomepageAds({
  topAds,
  midAds,
  bottomAds,
}: {
  topAds: AdRow[];
  midAds: AdRow[];
  bottomAds: AdRow[];
}) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    fetch("/api/v22/reader-context", { credentials: "same-origin" })
      .then((r) => (r.ok ? r.json() : { isVip: false }))
      .then((data: ReaderPayload) => setShow(!data.isVip))
      .catch(() => setShow(true));
  }, []);

  if (!show) return null;

  return (
    <>
      {topAds.length > 0 ? (
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <AdPlacement ads={topAds} variant="banner" />
        </div>
      ) : null}
      {midAds.length > 0 ? (
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <AdPlacement ads={midAds} variant="inline" />
        </div>
      ) : null}
      {bottomAds.length > 0 ? (
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <AdPlacement ads={bottomAds} variant="banner" />
        </div>
      ) : null}
    </>
  );
}
