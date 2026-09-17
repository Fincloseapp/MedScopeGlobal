import { AiAgentsDesk } from "@/components/admin/ai-agents-desk";
import { loadAiOpsSnapshot } from "@/lib/growth/ai-ops";

export const dynamic = "force-dynamic";

export default async function AdminAiAgentsPage() {
  const snap = await loadAiOpsSnapshot();
  return <AiAgentsDesk initial={snap} />;
}
