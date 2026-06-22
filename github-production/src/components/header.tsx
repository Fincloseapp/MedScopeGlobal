"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { navItems } from "@/lib/site";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <header className="site-header">
      <Link className="brand" href="/" onClick={() => setOpen(false)}>
        <span className="brand-mark" aria-hidden>
          M
        </span>
        <span>
          MedScopeGlobal
          <small style={{ display: "block", fontSize: ".72rem", color: "var(--muted)" }}>
            Odborný medicínský magazín
          </small>
        </span>
      </Link>
      <button
        type="button"
        className="menu-button"
        aria-expanded={open}
        aria-controls="site-nav"
        onClick={() => setOpen((value) => !value)}
      >
        <span className="sr-only">Otevřít navigaci</span>
        <span />
        <span />
        <span />
      </button>
      <nav id="site-nav" className={`nav${open ? " nav-open" : ""}`}>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={isActive(item.href) ? "active" : undefined}
            onClick={() => setOpen(false)}
          >
            {item.label}
          </Link>
        ))}
        <Link className="nav-cta" href="/auth/login" onClick={() => setOpen(false)}>
          Přihlášení
        </Link>
        <Link className="button primary nav-cta" href="/auth/register" onClick={() => setOpen(false)}>
          Registrace
        </Link>
      </nav>
    </header>
  );
}
