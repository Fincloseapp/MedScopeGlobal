import type { Metadata } from "next";
import { PrepShell } from "@/components/prep/prep-shell";
import { PrepGamesView } from "@/components/prep/games-view";
import { buildV20PageMetadata } from "@/lib/v20/seo";

export const metadata: Metadata = buildV20PageMetadata({
  title: "Hry — MeDiprep",
  description: "Pexeso pojmů a rychlý kvíz z biologie, chemie a fyziky k přijímačkám na lékařskou fakultu.",
  path: "/prep/hry",
});

export default function PrepGamesPage() {
  return (
    <PrepShell active="/prep/hry">
      <PrepGamesView />
    </PrepShell>
  );
}
