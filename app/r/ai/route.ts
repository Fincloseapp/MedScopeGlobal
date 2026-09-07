import { handleAiHop } from "@/lib/growth/ai-hop-handler";

export const dynamic = "force-dynamic";

/** Stable hop for AI agents: /r/ai?ref=claude&locale=de&to=predplatne */
export async function GET(request: Request) {
  return handleAiHop(request);
}
