import { DrugSourceListing } from "@/components/v4c/drug-source-listing";
import { getDrugNewsFiltered } from "@/lib/queries/v4c/drug-news";
import { getDrugSourceById } from "@/lib/v4c/drug-sources";

export const metadata = {
  title: "FDA — Novinky | MedScopeGlobal",
};

export default async function FdaNovinkyPage() {
  const source = getDrugSourceById("fda-whats-new")!;
  const items = await getDrugNewsFiltered({ sourceId: "fda-whats-new" });

  return (
    <DrugSourceListing
      backHref="/leky/fda"
      backLabel="FDA"
      eyebrow="FDA · Novinky"
      title={source.labelCs}
      description={source.descriptionCs ?? ""}
      items={items}
    />
  );
}
