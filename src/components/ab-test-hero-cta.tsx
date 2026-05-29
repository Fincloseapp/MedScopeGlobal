"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { trackClientEvent } from "./analytics-provider";
const variants = { insight: { label: "Prozkoumat medicínské poznatky", href: "/articles" }, event: { label: "Najít odbornou událost", href: "/events" } } as const;
type Variant = keyof typeof variants;
export function AbTestHeroCta() { const [variant, setVariant] = useState<Variant>("insight"); useEffect(() => { const stored = window.localStorage.getItem("msg.hero.cta") as Variant | null; const selected = stored ?? (Math.random() > 0.5 ? "event" : "insight"); window.localStorage.setItem("msg.hero.cta", selected); setVariant(selected); trackClientEvent({ name: "ab_exposure", value: { experiment: "hero_cta", variant: selected } }); }, []); const config = variants[variant]; return <Link className="button primary" href={config.href} onClick={() => trackClientEvent({ name: "ab_conversion", value: { experiment: "hero_cta", variant } })}>{config.label}</Link>; }
