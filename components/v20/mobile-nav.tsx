"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { Category } from "@/types/database";
import { MedScopeLogo } from "@/components/brand/medscope-logo";
import type { NavItem } from "@/lib/config/main-navigation";

export function V20MobileNav({
  mainMenu,
  categories,
}: {
  mainMenu: NavItem[];
  categories: Category[];
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    setOpen(false);
    setExpanded(null);
  }, [pathname]);

  const isActive = (href: string) =>
    href === "/" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  const topCategories = categories.slice(0, 8);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="xl:hidden touch-manipulation"
          aria-label="Otevřít menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="flex w-[min(100vw-1rem,380px)] flex-col overflow-y-auto overscroll-contain pb-[env(safe-area-inset-bottom)]"
      >
        <SheetHeader className="shrink-0 text-left">
          <MedScopeLogo href="/" width={140} height={34} className="mb-2" imageClassName="max-h-8" />
          <SheetTitle className="font-display text-lg text-[#021d33]">Navigace</SheetTitle>
        </SheetHeader>

        <nav className="mt-4 flex-1 space-y-2" aria-label="Mobilní navigace">
          {mainMenu.map((item) => {
            const hasChildren = Boolean(item.children?.length);
            const isExpanded = expanded === item.label;
            return (
              <div key={item.label} className="rounded-xl border border-slate-200 p-3">
                <div className="flex items-center justify-between gap-2">
                  {hasChildren ? (
                    <button
                      type="button"
                      aria-expanded={isExpanded}
                      className={`flex-1 text-left text-sm font-semibold ${isActive(item.href) ? "text-primary" : "text-[#021d33]"}`}
                      onClick={() => setExpanded(isExpanded ? null : item.label)}
                    >
                      {item.label}
                    </button>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={`flex-1 text-sm font-semibold ${isActive(item.href) ? "text-primary" : "text-[#021d33]"}`}
                    >
                      {item.label}
                    </Link>
                  )}
                  {hasChildren && (
                    <button
                      type="button"
                      aria-expanded={isExpanded}
                      aria-label={`Rozbalit ${item.label}`}
                      className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
                      onClick={() => setExpanded(isExpanded ? null : item.label)}
                    >
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                      />
                    </button>
                  )}
                </div>
                {hasChildren && isExpanded && (
                  <div className="mt-2 space-y-1 border-t border-slate-100 pt-2">
                    {item.children!.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={() => setOpen(false)}
                        className={`block rounded-lg px-2 py-2 text-sm ${pathname === child.href ? "bg-primary/10 font-medium text-primary" : "text-slate-600"}`}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {topCategories.length > 0 && (
            <div className="rounded-xl border border-slate-200 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                Obory
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {topCategories.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/category/${cat.slug}`}
                    onClick={() => setOpen(false)}
                    className="rounded-full border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 hover:border-primary/40 hover:text-primary"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </nav>

        <div className="mt-4 shrink-0 flex flex-col gap-2 border-t border-slate-200 pt-4">
          <Button asChild className="rounded-full bg-primary touch-manipulation">
            <Link href="/subscribe" onClick={() => setOpen(false)}>
              Předplatné
            </Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full touch-manipulation">
            <Link href="/login" onClick={() => setOpen(false)}>
              Přihlášení
            </Link>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
