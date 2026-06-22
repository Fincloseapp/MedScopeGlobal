import { DrugSourceListing } from "@/components/v4c/drug-source-listing";
import { getDrugNewsFiltered } from "@/lib/queries/v4c/drug-news";
import { getDrugSourceById } from "@/lib/v4c/drug-sources";

export const metadata = {
  title: "EMA — EPAR a stanoviska | MedScopeGlobal",
};

export default async function EmaEparPage() {
  const source = getDrugSourceById("ema-human-epar")!;
  const items = await getDrugNewsFiltered({ sourceId: "ema-human-epar" });

  return (
    <DrugSourceListing
      backHref="/leky/ema"
      backLabel="EMA"
      eyebrow="EMA · EPAR"
      title={source.labelCs}
      description={source.descriptionCs ?? ""}
      items={items}
    />
  );
}
