"use client";

import { useCallback, useMemo, useState } from "react";
import {
  dueDateFromSummary,
  formatControlDayCs,
  pragueToday,
  type ControlReminderStatus,
} from "@/lib/medipacient/control-reminder";
import { controlEventTitle } from "@/lib/medipacient/control-calendar";
import type { PatientSummary } from "@/lib/medipacient/patient-summary";

export type PacientDocLike = {
  id: string;
  name: string;
  patientSummary?: PatientSummary | null;
  controlReminder?: {
    dueAt: string;
    status: ControlReminderStatus;
    emailSentOn?: string | null;
  };
};

export type UpcomingControl = {
  documentId: string;
  name: string;
  title: string;
  dueAt: string;
  dueLabel: string;
  overdue: boolean;
  today: boolean;
};

export function useMeDipacientKontroly(docs: PacientDocLike[]) {
  const [overlay, setOverlay] = useState<Record<string, ControlReminderStatus>>({});

  const upcoming = useMemo(() => {
    const today = pragueToday();
    const items: UpcomingControl[] = [];
    for (const doc of docs) {
      const dueAt = doc.controlReminder?.dueAt || dueDateFromSummary(doc.patientSummary);
      if (!dueAt) continue;
      const status = overlay[doc.id] || doc.controlReminder?.status || "open";
      if (status !== "open") continue;
      items.push({
        documentId: doc.id,
        name: doc.name,
        title: controlEventTitle(doc.patientSummary?.obor_lekare),
        dueAt,
        dueLabel: formatControlDayCs(dueAt),
        overdue: dueAt < today,
        today: dueAt === today,
      });
    }
    return items.sort((a, b) => a.dueAt.localeCompare(b.dueAt));
  }, [docs, overlay]);

  const setStatus = useCallback(async (documentId: string, status: ControlReminderStatus) => {
    setOverlay((prev) => ({ ...prev, [documentId]: status }));
    try {
      const res = await fetch(`/api/medipacient/documents/${encodeURIComponent(documentId)}/reminder`, {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        setOverlay((prev) => {
          const next = { ...prev };
          delete next[documentId];
          return next;
        });
        return false;
      }
      return true;
    } catch {
      setOverlay((prev) => {
        const next = { ...prev };
        delete next[documentId];
        return next;
      });
      return false;
    }
  }, []);

  const markDone = useCallback((documentId: string) => setStatus(documentId, "done"), [setStatus]);
  const dismiss = useCallback((documentId: string) => setStatus(documentId, "dismissed"), [setStatus]);

  const isOnHome = useCallback(
    (documentId: string, dueAt: string) => upcoming.some((item) => item.documentId === documentId && item.dueAt === dueAt),
    [upcoming],
  );

  return { upcoming, markDone, dismiss, isOnHome };
}
