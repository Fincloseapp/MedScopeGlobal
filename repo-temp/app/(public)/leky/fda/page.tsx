import { DrugAgencyHub } from "@/components/v4c/drug-agency-hub";
import { getDrugNewsFiltered } from "@/lib/queries/v4c/drug-news";

export const metadata = {
  title: "FDA | Léky | MedScopeGlobal",
  description: "U.S. FDA — novinky k humánním léčivým přípravkům na MedScopeGlobal.",
};

export default async function FdaHubPage() {
  const previewItems = await getDrugNewsFiltered({ agency: "fda", limit: 4 });
  return <DrugAgencyHub agency="fda" previewItems={previewItems} />;
}
