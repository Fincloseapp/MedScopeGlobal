"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { medicalNavGroups } from "@/lib/medical-sections";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  function isGroupActive(item: (typeof medicalNavGroups)[number]) {
    if (item.href) return isActive(item.href);
    return item.children?.some((child) => isActive(child.href)) ?? false;
  }

  function closeMenus() {
    setOpen(false);
    setOpenDropdown(null);
  }

  return (
    <header className="site-header">
      <Link href="/" className="brand" onClick={closeMenus}>
        <span className="brand-mark">M</span>
        <span>MedScopeGlobal</span>
      </Link>
      <button
        className="menu-button"
        type="button"
        aria-expanded={open}
        aria-controls="primary-nav"
        onClick={() => setOpen((value) => !value)}
      >
        <span className="sr-only">Otevřít navigaci</span>
        <span />
        <span />
        <span />
      </button>
      <nav id="primary-nav" className={open ? "nav nav-open" : "nav"} aria-label="Hlavní navigace">
        {medicalNavGroups.map((item) =>
          item.children ? (
            <div className="nav-dropdown" key={item.label}>
              <button
                type="button"
                className={isGroupActive(item) ? "active" : ""}
                aria-expanded={openDropdown === item.label}
                onClick={() => setOpenDropdown((value) => (value === item.label ? null : item.label))}
              >
                {item.label} <span aria-hidden="true">▼</span>
              </button>
              <div className={openDropdown === item.label ? "dropdown-menu open" : "dropdown-menu"}>
                {item.children.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    className={isActive(child.href) ? "active" : ""}
                    onClick={closeMenus}
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <Link
              key={item.href}
              href={item.href ?? "/"}
              className={isGroupActive(item) ? "active" : ""}
              onClick={closeMenus}
            >
              {item.label}
            </Link>
          )
        )}
        <Link href="/auth/login" className={isActive("/auth/login") ? "active nav-cta" : "nav-cta"} onClick={closeMenus}>
          Přihlášení
        </Link>
      </nav>
    </header>
  );
}
