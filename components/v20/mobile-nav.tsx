"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { Category } from "@/types/database";
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

  const isActive = (href: string) =>
    href === "/" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  const topCategories = categories.slice(0, 8);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="xl:hidden" aria-label="Otevřít menu">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="flex w-[min(100vw-1rem,360px)] flex-col overflow-y-auto">
        <SheetHeader className="text-left">
          <SheetTitle className="font-display text-lg text-[#021d33]">Navigace</SheetTitle>
        </SheetHeader>

        <nav className="mt-4 flex-1 space-y-2" aria-label="Mobilní navigace">
          {mainMenu.map((item) => (
            <div key={item.label} className="rounded-xl border border-slate-200 p-3">
              <Link
                href={item.href}
                onClick={() => setOpen(false)}
                className={`block text-sm font-semibold ${isActive(item.href) ? "text-primary" : "text-[#021d33]"}`}
              >
                {item.label}
              </Link>
              {item.children && (
                <div className="mt-2 space-y-1 border-t border-slate-100 pt-2">
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      onClick={() => setOpen(false)}
                      className={`block rounded-lg px-2 py-1.5 text-sm ${pathname === child.href ? "bg-primary/10 font-medium text-primary" : "text-slate-600"}`}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}

          {topCategories.length > 0 && (
            <div className="rounded-xl border border-slate-200 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                Odborné obory
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

        <div className="mt-4 flex flex-col gap-2 border-t border-slate-200 pt-4">
          <Button asChild className="rounded-full bg-primary">
            <Link href="/subscribe" onClick={() => setOpen(false)}>
              Předplatné
            </Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/login" onClick={() => setOpen(false)}>
              Přihlášení
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={() => setOpen(false)}
          >
            <X className="mr-2 h-4 w-4" />
            Zavřít
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
