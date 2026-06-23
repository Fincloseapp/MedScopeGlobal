import { DrugAgencyHub } from "@/components/v4c/drug-agency-hub";
import { getDrugNewsFiltered } from "@/lib/queries/v4c/drug-news";

export const metadata = {
  title: "EMA | Léky | MedScopeGlobal",
  description: "Evropská agentura pro léčivé přípravky — novinky, léčiva a EPAR na MedScopeGlobal.",
};

export default async function EmaHubPage() {
  const previewItems = await getDrugNewsFiltered({ agency: "ema", limit: 4 });
  return <DrugAgencyHub agency="ema" previewItems={previewItems} />;
}
