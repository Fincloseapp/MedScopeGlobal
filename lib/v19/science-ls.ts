import { V19_SOURCE_TOPICS } from "@/lib/v19/sources";
import { SCIENCE_PUBLICATION_NOTICE } from "@/lib/v19/legal";
import type { V19ContentMode } from "@/lib/v19/types";

export function getV19ScienceListing() {
  const scienceSources = V19_SOURCE_TOPICS.filter((t) => t.tier === "science");
  return {
    version: "v19.8",
    notice: SCIENCE_PUBLICATION_NOTICE,
    modes: ["doctor", "patient", "scientist"] as V19ContentMode[],
    layers: {
      doctor: "klinický dopad + shrnutí evidence",
      patient: "srozumitelné shrnutí bez terminologie",
      scientist: "vědecký kontext + metodologie (obecně)",
    },
    sources: scienceSources.map((s) => ({
      id: s.id,
      name: s.sourceName,
      url: s.sourceUrl,
      specialty: s.specialty,
      publicationRef: s.publicationRef,
      topic: s.topic,
    })),
    count: scienceSources.length,
  };
}
