import { validateElevenLabsKey, isElevenLabsConfigured } from "@/lib/v40/ai/voice-elevenlabs";
import { isOpenAiConfigured } from "@/lib/ai/openai-key";
import { createServiceRoleClient } from "@/lib/supabase/service";

export type KeyHealth = {
  key_name: string;
  configured: boolean;
  valid: boolean;
  age_days: number | null;
  status: "ok" | "warning" | "critical" | "missing";
  message: string;
};

const KEY_ROTATION_WARN_DAYS = 30;

function estimateKeyAgeDays(envVar: string): number | null {
  const rotatedAt = process.env[`${envVar}_ROTATED_AT`]?.trim();
  if (!rotatedAt) return null;
  const ts = Date.parse(rotatedAt);
  if (Number.isNaN(ts)) return null;
  return Math.floor((Date.now() - ts) / 86_400_000);
}

export async function checkElevenLabsKeyHealth(): Promise<KeyHealth> {
  const configured = isElevenLabsConfigured();
  if (!configured) {
    return {
      key_name: "ELEVENLABS_API_KEY",
      configured: false,
      valid: false,
      age_days: null,
      status: "missing",
      message: "ELEVENLABS_API_KEY not set",
    };
  }

  const { valid, status } = await validateElevenLabsKey();
  const age_days = estimateKeyAgeDays("ELEVENLABS_API_KEY");

  let keyStatus: KeyHealth["status"] = valid ? "ok" : "critical";
  let message = valid ? "ElevenLabs key valid" : `ElevenLabs key invalid (HTTP ${status}) — regenerate at elevenlabs.io`;

  if (valid && age_days !== null && age_days > KEY_ROTATION_WARN_DAYS) {
    keyStatus = "warning";
    message = `ElevenLabs key is ${age_days} days old — consider rotation (> ${KEY_ROTATION_WARN_DAYS} days)`;
  }

  return {
    key_name: "ELEVENLABS_API_KEY",
    configured: true,
    valid,
    age_days,
    status: keyStatus,
    message,
  };
}

export function checkOpenAiKeyHealth(): KeyHealth {
  const configured = isOpenAiConfigured();
  const age_days = estimateKeyAgeDays("OPENAI_API_KEY");
  let status: KeyHealth["status"] = configured ? "ok" : "missing";
  let message = configured ? "OpenAI key configured" : "OPENAI_API_KEY not set or invalid format";

  if (configured && age_days !== null && age_days > KEY_ROTATION_WARN_DAYS) {
    status = "warning";
    message = `OpenAI key is ${age_days} days old — consider rotation`;
  }

  return {
    key_name: "OPENAI_API_KEY",
    configured,
    valid: configured,
    age_days,
    status,
    message,
  };
}

export async function runKeyRotationCheck(): Promise<{
  keys: KeyHealth[];
  alerts: string[];
  checked_at: string;
}> {
  const keys = await Promise.all([checkElevenLabsKeyHealth(), Promise.resolve(checkOpenAiKeyHealth())]);
  const alerts = keys
    .filter((k) => k.status === "critical" || k.status === "warning" || k.status === "missing")
    .map((k) => `${k.key_name}: ${k.message}`);

  const admin = createServiceRoleClient();
  for (const k of keys) {
    try {
      await admin.from("v42_key_rotation_log").insert({
        key_name: k.key_name,
        status: k.status,
        age_days: k.age_days,
        message: k.message,
      });
    } catch {
      /* table may not exist yet */
    }
  }

  return { keys, alerts, checked_at: new Date().toISOString() };
}
