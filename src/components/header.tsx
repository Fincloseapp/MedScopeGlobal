"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { navItems } from "@/lib/site";
export function Header() { const pathname = usePathname(); const [open, setOpen] = useState(false); return <header className="site-header"><Link href="/" className="brand" onClick={() => setOpen(false)}><span className="brand-mark">M</span><span>MedScopeGlobal</span></Link><button className="menu-button" type="button" aria-expanded={open} aria-controls="primary-nav" onClick={() => setOpen((value) => !value)}><span className="sr-only">Otevřít navigaci</span><span /><span /><span /></button><nav id="primary-nav" className={open ? "nav nav-open" : "nav"} aria-label="Hlavní navigace">{navItems.map((item) => <Link key={item.href} href={item.href} className={pathname === item.href ? "active" : ""} onClick={() => setOpen(false)}>{item.label}</Link>)}</nav></header>; }
