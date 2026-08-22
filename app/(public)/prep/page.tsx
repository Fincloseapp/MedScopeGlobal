import type { Metadata } from "next";
import { PrepLanding } from "@/components/prep/prep-landing";
import { PrepShell } from "@/components/prep/prep-shell";
import { buildV20PageMetadata } from "@/lib/v20/seo";

export const metadata: Metadata = buildV20PageMetadata({
  title: "MeDiprep — příprava na přijímačky LF",
  description:
    "Originální testy z biologie, chemie a fyziky pro české lékařské fakulty. Simulace s časem, učení po kapitolách, drill slabých míst a týdenní plán.",
  path: "/prep",
});

export default function PrepPage() {
  return (
    <PrepShell active="/prep">
      <PrepLanding />
    </PrepShell>
  );
}
