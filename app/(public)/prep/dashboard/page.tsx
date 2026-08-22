import type { Metadata } from "next";
import { PrepShell } from "@/components/prep/prep-shell";
import { PrepDashboard } from "@/components/prep/dashboard-view";
import { buildV20PageMetadata } from "@/lib/v20/seo";

export const metadata: Metadata = buildV20PageMetadata({
  title: "Plán a skóre — MeDiprep",
  description: "Týdenní plán učení, statistiky slabých míst a vývoj skóre při přípravě na přijímačky LF.",
  path: "/prep/dashboard",
});

export default function PrepDashboardPage() {
  return (
    <PrepShell active="/prep/dashboard">
      <PrepDashboard />
    </PrepShell>
  );
}
