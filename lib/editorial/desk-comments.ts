/**
 * Foreign desks write natively. Borrowed/translated pieces may receive
 * a short editorial comment from the local desk — never a silent overwrite.
 */

import type { GlobalLocaleCode } from "@/lib/ecosystem/locales";

export type DeskCommentKind = "borrow" | "native" | "cross_reference";

export type DeskComment = {
  fromLocale: GlobalLocaleCode;
  onLocale: GlobalLocaleCode;
  kind: DeskCommentKind;
  body: string;
  at: string;
};

export function foreignDeskMayComment(
  sourceLocale: GlobalLocaleCode,
  commentLocale: GlobalLocaleCode
): boolean {
  return sourceLocale !== commentLocale;
}

export function buildDeskComment(input: {
  fromLocale: GlobalLocaleCode;
  onLocale: GlobalLocaleCode;
  kind: DeskCommentKind;
  note?: string;
}): DeskComment | null {
  if (!foreignDeskMayComment(input.onLocale, input.fromLocale) && input.kind === "borrow") {
    return null;
  }
  const note =
    input.note?.trim() ||
    (input.kind === "borrow"
      ? "Local desk reviewed a borrowed piece and added context for this edition."
      : "Native desk note.");
  return {
    fromLocale: input.fromLocale,
    onLocale: input.onLocale,
    kind: input.kind,
    body: note,
    at: new Date().toISOString(),
  };
}

export function attachDeskComments(
  metadata: Record<string, unknown> | null | undefined,
  comment: DeskComment | null
): Record<string, unknown> {
  const base = metadata && typeof metadata === "object" ? { ...metadata } : {};
  if (!comment) return base;
  const prev = Array.isArray(base.desk_comments) ? (base.desk_comments as DeskComment[]) : [];
  return { ...base, desk_comments: [...prev, comment] };
}
