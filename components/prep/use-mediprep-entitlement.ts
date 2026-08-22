"use client";

import { useEffect, useState } from "react";

export function useMeDiprepEntitlement() {
  const [entitled, setEntitled] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    fetch("/api/mediprep/session", { credentials: "same-origin" })
      .then((r) => (r.ok ? r.json() : { entitled: false }))
      .then((data: { entitled?: boolean }) => setEntitled(Boolean(data.entitled)))
      .catch(() => setEntitled(false))
      .finally(() => setReady(true));
  }, []);

  return { entitled, ready };
}
