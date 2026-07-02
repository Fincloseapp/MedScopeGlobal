import { DrugSourceListing } from "@/components/v4c/drug-source-listing";
import { getDrugNewsFiltered } from "@/lib/queries/v4c/drug-news";
import { getDrugSourceById } from "@/lib/v4c/drug-sources";

export const metadata = {
  title: "SÚKL — Důležité informace | MedScopeGlobal",
};

export default async function SuklDulezitePage() {
  const source = getDrugSourceById("sukl-dulezite")!;
  const items = await getDrugNewsFiltered({ sourceId: "sukl-dulezite" });

  return (
    <DrugSourceListing
      backHref="/leky/sukl"
      backLabel="SÚKL"
      eyebrow="SÚKL · Důležité informace"
      title={source.labelCs}
      description={source.descriptionCs ?? ""}
      items={items}
    />
  );
}
