import { DrugAgencyHub } from "@/components/v4c/drug-agency-hub";
import { getDrugNewsFiltered } from "@/lib/queries/v4c/drug-news";

export const metadata = {
  title: "SÚKL | Léky | MedScopeGlobal",
  description: "Lékové informace ze Státního ústavu pro kontrolu léčiv — důležité sdělení a přehled léčiv.",
};

export default async function SuklHubPage() {
  const previewItems = await getDrugNewsFiltered({ agency: "sukl", limit: 4 });
  return <DrugAgencyHub agency="sukl" previewItems={previewItems} />;
}
