import { DrugSourceListing } from "@/components/v4c/drug-source-listing";
import { getDrugNewsFiltered } from "@/lib/queries/v4c/drug-news";
import { getDrugSourceById } from "@/lib/v4c/drug-sources";

export const metadata = {
  title: "EMA — Léčivé přípravky | MedScopeGlobal",
};

export default async function EmaMedicinesPage() {
  const source = getDrugSourceById("ema-medicines")!;
  const items = await getDrugNewsFiltered({ sourceId: "ema-medicines" });

  return (
    <DrugSourceListing
      backHref="/leky/ema"
      backLabel="EMA"
      eyebrow="EMA · Léčivé přípravky"
      title={source.labelCs}
      description={source.descriptionCs ?? ""}
      items={items}
    />
  );
}
