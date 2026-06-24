import { Unlock } from "lucide-react";
import Link from "next/link";
import { formatFreePreviewLabel } from "@/lib/academy/preview";

export function FreePreviewBanner({
  totalLessons,
  className = "",
}: {
  totalLessons: number;
  className?: string;
}) {
  if (totalLessons <= 0) return null;

  return (
    <div
      className={`flex flex-wrap items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/80 px-4 py-3 text-sm text-emerald-900 ${className}`}
    >
      <Unlock className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
      <p>
        <strong>Náhled zdarma:</strong> {formatFreePreviewLabel(totalLessons)} — bez předplatného.
      </p>
      <Link
        href="/predplatne"
        className="ml-auto text-xs font-medium text-emerald-800 underline-offset-2 hover:underline"
      >
        Studentské předplatné →
      </Link>
    </div>
  );
}
