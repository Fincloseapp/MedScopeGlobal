import { V25_PROD_BASE } from "@/lib/v25/config";
import { appendV25Log } from "@/lib/v25/data-store";
import { V25_ENGINE_VERSION } from "@/lib/v25/version";
import type { V25ApiStatus } from "@/lib/v25/types";
import { updateV25TestStatus } from "@/lib/v25/system-state";

export async function verifyV25Apis(base = V25_PROD_BASE): Promise<{
  ok: boolean;
  apis: V25ApiStatus[];
}> {
  const paths = ["/api/v19/health", "/api/v24/health", "/api/v24/monitoring", "/api/v25/health"];
  const apis: V25ApiStatus[] = [];

  for (const path of paths) {
    try {
      const res = await fetch(`${base}${path}`, { cache: "no-store" });
      let version: string | undefined;
      try {
        const json = (await res.json()) as { version?: string; uiVersion?: string };
        version = json.version ?? json.uiVersion;
      } catch {
        /* non-json */
      }
      apis.push({ path, status: res.status, ok: res.ok, version });
    } catch {
      apis.push({ path, status: 0, ok: false });
    }
  }

  const ok = apis.every((a) => a.ok);
  appendV25Log("verify", `API verify ${ok ? "PASS" : "FAIL"} ${apis.map((a) => a.path).join(",")}`);
  updateV25TestStatus({ verifyEngine: ok ? "ok" : "fail" });
  return { ok, apis };
}

export async function verifyV25Homepage(base = V25_PROD_BASE): Promise<boolean> {
  try {
    const res = await fetch(`${base}/?_${Date.now()}`, { cache: "no-store" });
    const text = await res.text();
    const ok =
      res.ok &&
      (text.includes("MedScope") || text.includes("AI Medical")) &&
      !text.includes("Application error");
    appendV25Log("verify", `Homepage ${ok ? "PASS" : "FAIL"}`);
    return ok;
  } catch (e) {
    appendV25Log("verify", `Homepage FAIL: ${(e as Error).message}`);
    return false;
  }
}

export function getV25VerifyMeta() {
  return { version: V25_ENGINE_VERSION, engine: "v25.4-enterprise" };
}
