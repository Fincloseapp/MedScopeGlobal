import { medicalSources } from "@/lib/portal/sources";
import { jsonResponse } from "@/lib/portal/request";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const specialization = searchParams.get("specialization");
  const sources = specialization
    ? medicalSources.filter((source) => source.specialties.includes(specialization))
    : medicalSources;
  return jsonResponse({ sources });
}
