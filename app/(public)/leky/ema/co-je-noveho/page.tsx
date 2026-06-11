import { DrugSourceListing } from "@/components/v4c/drug-source-listing";
import { getDrugNewsFiltered } from "@/lib/queries/v4c/drug-news";
import { getDrugSourceById } from "@/lib/v4c/drug-sources";

export const metadata = {
  title: "EMA — Co je nového | MedScopeGlobal",
};

export default async function EmaWhatsNewPage() {
  const source = getDrugSourceById("ema-whats-new")!;
  const items = await getDrugNewsFiltered({ sourceId: "ema-whats-new" });

  return (
    <DrugSourceListing
      backHref="/leky/ema"
      backLabel="EMA"
      eyebrow="EMA · Co je nového"
      title={source.labelCs}
      description={source.descriptionCs ?? ""}
      items={items}
    />
  );
}
