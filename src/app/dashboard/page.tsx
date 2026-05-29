import type { Metadata } from "next";
import { Metrics } from "@/components/metrics";
import { PreferenceForm } from "@/components/preference-form";
import { funnelMetrics } from "@/lib/data";
export const metadata: Metadata = { title: "Growth dashboard", description: "Analytics, funnel tracking, segmentation and personalization foundation." };
export default function DashboardPage() { return <main className="section"><p className="eyebrow">Analytics + Growth mode</p><h1>Funnel, segmentace a personalizace připravené pro optimalizaci.</h1><p className="lead">GA4, server-side event logging a role-based preference persistence sledují registrace, article/event views, kalendářové kliky a formuláře.</p><Metrics items={funnelMetrics} /><div style={{ marginTop: "1.5rem" }}><PreferenceForm /></div></main>; }
