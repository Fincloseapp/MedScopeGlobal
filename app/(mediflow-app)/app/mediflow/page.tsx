import type { Metadata } from "next";
import { MediFlowAppShell } from "@/components/mediflow/mediflow-app-shell";
import { MEDIFLOW, appSeoDescription, appSeoTitle } from "@/lib/apps/catalog";

export const metadata: Metadata = {
  title: appSeoTitle(MEDIFLOW),
  description: appSeoDescription(MEDIFLOW),
  manifest: MEDIFLOW.manifest,
  appleWebApp: { capable: true, title: MEDIFLOW.shortName },
  themeColor: MEDIFLOW.themeColor,
};

export default function MediFlowAppPage() {
  return <MediFlowAppShell />;
}
