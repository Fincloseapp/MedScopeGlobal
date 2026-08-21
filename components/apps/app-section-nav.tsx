"use client";

import type { LucideIcon } from "lucide-react";

export type AppSectionTab<T extends string = string> = {
  id: T;
  label: string;
  icon: LucideIcon;
  locked?: boolean;
};

type Props<T extends string> = {
  tabs: readonly AppSectionTab<T>[];
  active: T;
  onChange: (id: T) => void;
  /** Accent color for active tab (hex) */
  accent?: string;
  ariaLabel: string;
  /** Show fixed bottom bar on small screens */
  showBottom?: boolean;
};

/**
 * Always-visible section control panel: top strip on all viewports,
 * optional fixed bottom bar on mobile for thumb reach.
 */
export function AppSectionNav<T extends string>({
  tabs,
  active,
  onChange,
  accent = "#C45C26",
  ariaLabel,
  showBottom = true,
}: Props<T>) {
  return (
    <>
      <nav className="shrink-0 border-b border-slate-200 bg-white" aria-label={ariaLabel}>
        <div className="mx-auto grid max-w-5xl grid-cols-4 gap-0.5 px-1 py-1 sm:px-2 md:flex md:flex-wrap md:gap-1 md:px-3 md:py-1.5">
          {tabs.map(({ id, label, icon: Icon, locked }) => {
            const isActive = active === id;
            return (
              <button
                key={id}
                type="button"
                disabled={locked}
                onClick={() => onChange(id)}
                className={`flex flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-2 text-[11px] font-semibold touch-manipulation md:flex-row md:gap-2 md:px-3 md:py-2 md:text-sm ${
                  locked ? "opacity-40" : ""
                } ${isActive ? "" : "text-slate-500 hover:bg-slate-50"}`}
                style={
                  isActive
                    ? { color: accent, backgroundColor: `${accent}18` }
                    : undefined
                }
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className="h-5 w-5 shrink-0" style={{ color: isActive ? accent : "#94a3b8" }} />
                {label}
              </button>
            );
          })}
        </div>
      </nav>

      {showBottom ? (
        <nav
          className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur md:hidden"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
          aria-label={`${ariaLabel} — mobil`}
        >
          <div className="mx-auto grid max-w-3xl grid-cols-4">
            {tabs.map(({ id, label, icon: Icon, locked }) => {
              const isActive = active === id;
              return (
                <button
                  key={`bot-${id}`}
                  type="button"
                  disabled={locked}
                  onClick={() => onChange(id)}
                  className={`flex flex-col items-center gap-0.5 px-1 py-2.5 text-[11px] font-medium touch-manipulation ${
                    locked ? "opacity-40" : ""
                  }`}
                  style={{ color: isActive ? accent : "#64748b" }}
                >
                  <Icon className="h-5 w-5" style={{ color: isActive ? accent : "#94a3b8" }} />
                  {label}
                </button>
              );
            })}
          </div>
        </nav>
      ) : null}
    </>
  );
}
