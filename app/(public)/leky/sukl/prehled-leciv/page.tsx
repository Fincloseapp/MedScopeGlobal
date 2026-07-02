import { DrugSourceListing } from "@/components/v4c/drug-source-listing";
import { getDrugNewsFiltered } from "@/lib/queries/v4c/drug-news";
import { getDrugSourceById } from "@/lib/v4c/drug-sources";

export const metadata = {
  title: "SÚKL — Přehled léčiv | MedScopeGlobal",
};

export default async function SuklPrehledLecivPage() {
  const source = getDrugSourceById("sukl-prehled-leciv")!;
  const items = await getDrugNewsFiltered({ sourceId: "sukl-prehled-leciv", status: "approved" });

  return (
    <DrugSourceListing
      backHref="/leky/sukl"
      backLabel="SÚKL"
      eyebrow="SÚKL · Přehled léčiv"
      title={source.labelCs}
      description={
        source.descriptionCs ??
        "Registrované léčivé přípravky v ČR — schválení a změny v databázi SÚKL."
      }
      items={items}
      emptyMessage="Schválené přípravky se načítají z registru SÚKL…"
    />
  );
}
