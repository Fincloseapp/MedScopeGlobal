"use client";

import { useEffect } from "react";
import type { AnalyticsPayload } from "@/lib/analytics";
import { trackClientEvent } from "./analytics-provider";

export function ViewTracker({ payload }: { payload: AnalyticsPayload }) {
  useEffect(() => {
    trackClientEvent(payload);
  }, [payload]);

  return null;
}
