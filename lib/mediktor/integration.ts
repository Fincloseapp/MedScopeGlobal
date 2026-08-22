import { tryCreateServiceRoleClient } from "@/lib/supabase/service";

export type IntegrationType = "export" | "webhook" | "hl7" | "fhir" | "api";

export type IntegrationFormat = "text" | "pdf" | "docx" | "hl7" | "fhir";

export type MediktorIntegration = {
  id?: string;
  active: boolean;
  integrationType: IntegrationType;
  presetTarget?: string | null;
  formats: IntegrationFormat[];
  webhookUrl?: string | null;
  apiKeyHint?: string | null;
  config?: Record<string, unknown>;
};

export { INTEGRATION_PRESETS } from "@/lib/mediktor/presets";

function mapRow(row: Record<string, unknown>): MediktorIntegration {
  return {
    id: row.id as string | undefined,
    active: Boolean(row.active),
    integrationType: (row.integration_type as IntegrationType) || "export",
    presetTarget: (row.preset_target as string) ?? null,
    formats: (row.formats as IntegrationFormat[]) ?? ["text", "pdf"],
    webhookUrl: (row.webhook_url as string) ?? null,
    apiKeyHint: (row.api_key_hint as string) ?? null,
    config: (row.config as Record<string, unknown>) ?? {},
  };
}

export async function getIntegration(userId: string): Promise<MediktorIntegration | null> {
  const admin = tryCreateServiceRoleClient();
  if (!admin) return null;
  const { data } = await admin
    .from("mediktor_integrations")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  return data ? mapRow(data as Record<string, unknown>) : null;
}

export async function upsertIntegration(
  userId: string,
  input: Partial<MediktorIntegration> & { skip?: boolean }
): Promise<
  | { ok: true; integration: MediktorIntegration | null }
  | { ok: false; error: string; status: number }
> {
  const admin = tryCreateServiceRoleClient();
  if (!admin) {
    return { ok: false, error: "Služba dočasně nedostupná.", status: 503 };
  }

  if (input.skip) {
    const { data } = await admin
      .from("mediktor_integrations")
      .upsert(
        {
          user_id: userId,
          active: false,
          integration_type: "export",
          preset_target: null,
          formats: ["text", "pdf"],
          updated_at: new Date().toISOString(),
          config: { skipped: true },
        },
        { onConflict: "user_id" }
      )
      .select("*")
      .single();
    return { ok: true, integration: data ? mapRow(data as Record<string, unknown>) : null };
  }

  const formats = input.formats?.length ? input.formats : ["text", "pdf"];
  const integrationType = input.integrationType || "export";

  if (
    (integrationType === "webhook" || integrationType === "api") &&
    input.webhookUrl &&
    !/^https:\/\//i.test(input.webhookUrl)
  ) {
    return { ok: false, error: "Webhook/API URL musí začínat https://", status: 400 };
  }

  const { data, error } = await admin
    .from("mediktor_integrations")
    .upsert(
      {
        user_id: userId,
        active: input.active ?? true,
        integration_type: integrationType,
        preset_target: input.presetTarget ?? null,
        formats,
        webhook_url: input.webhookUrl ?? null,
        api_key_hint: input.apiKeyHint ?? null,
        config: input.config ?? {},
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    )
    .select("*")
    .single();

  if (error) {
    return { ok: false, error: error.message, status: 500 };
  }

  return { ok: true, integration: mapRow(data as Record<string, unknown>) };
}

function buildHl7Stub(note: string, title?: string | null): string {
  const ts = new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 14);
  const safe = note.replace(/\r?\n/g, "\\n").slice(0, 2000);
  return [
    `MSH|^~\\&|MEDIKTOR|MEDSCOPEGLOBAL|TARGET_NIS|FACILITY|${ts}||ORU^R01|${ts}|P|2.5`,
    `PID|||UNKNOWN||DOCTOR^USER`,
    `OBR|1|||MEDIKTOR_NOTE^${title || "Zápis"}`,
    `OBX|1|TX|NOTE||${safe}`,
  ].join("\r");
}

function buildFhirStub(note: string, title?: string | null, userId?: string) {
  return {
    resourceType: "DocumentReference",
    status: "current",
    type: { text: title || "MeDiktor clinical note" },
    subject: { display: "Patient (local chart)" },
    author: [{ display: `MeDiktor user ${userId || ""}` }],
    content: [
      {
        attachment: {
          contentType: "text/plain; charset=utf-8",
          data: Buffer.from(note, "utf8").toString("base64"),
          title: title || "zapis.txt",
        },
      },
    ],
    extension: [
      {
        url: "https://medscopeglobal.com/fhir/StructureDefinition/mediktor-stub",
        valueBoolean: true,
      },
    ],
  };
}

/**
 * Push completed dictation to linked SW. Real webhook when URL set; HL7/FHIR stubbed otherwise.
 */
export async function pushNoteToIntegration(opts: {
  userId: string;
  noteId?: string | null;
  note: string;
  title?: string | null;
  transcript?: string | null;
}): Promise<{ status: string; channel: string; preview?: string }> {
  const admin = tryCreateServiceRoleClient();
  if (!admin) {
    return { status: "failed", channel: "none", preview: "no admin client" };
  }

  const integration = await getIntegration(opts.userId);
  if (!integration?.active) {
    return { status: "stubbed", channel: "inactive" };
  }

  const channel = integration.integrationType;
  let payloadPreview = opts.note.slice(0, 400);
  let responseSummary: Record<string, unknown> = { stub: true };
  let status: "sent" | "failed" | "stubbed" = "stubbed";

  if (channel === "hl7" || integration.formats.includes("hl7")) {
    payloadPreview = buildHl7Stub(opts.note, opts.title);
    responseSummary = { format: "hl7_v2", stub: true, bytes: payloadPreview.length };
    status = "stubbed";
  }

  if (channel === "fhir" || integration.formats.includes("fhir")) {
    const fhir = buildFhirStub(opts.note, opts.title, opts.userId);
    payloadPreview = JSON.stringify(fhir).slice(0, 800);
    responseSummary = { format: "fhir_r4_DocumentReference", stub: true };
    status = "stubbed";
  }

  if (
    (channel === "webhook" || channel === "api") &&
    integration.webhookUrl &&
    /^https:\/\//i.test(integration.webhookUrl)
  ) {
    try {
      const res = await fetch(integration.webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Mediktor-Source": "medscopeglobal",
          ...(integration.apiKeyHint
            ? { Authorization: `Bearer ${integration.apiKeyHint}` }
            : {}),
        },
        body: JSON.stringify({
          type: "mediktor.note.completed",
          noteId: opts.noteId,
          title: opts.title,
          note: opts.note,
          transcript: opts.transcript,
          formats: integration.formats,
          presetTarget: integration.presetTarget,
          hl7: integration.formats.includes("hl7")
            ? buildHl7Stub(opts.note, opts.title)
            : undefined,
          fhir: integration.formats.includes("fhir")
            ? buildFhirStub(opts.note, opts.title, opts.userId)
            : undefined,
        }),
        signal: AbortSignal.timeout(8000),
      });
      status = res.ok ? "sent" : "failed";
      responseSummary = { httpStatus: res.status, stub: false };
      payloadPreview = opts.note.slice(0, 400);
    } catch (e) {
      status = "failed";
      responseSummary = {
        error: e instanceof Error ? e.message : "webhook failed",
      };
    }
  } else if (channel === "export") {
    status = "stubbed";
    responseSummary = {
      formats: integration.formats,
      note: "Uloženo v MeDiktor účtu; export ke stažení v aplikaci.",
    };
  }

  await admin.from("mediktor_integration_deliveries").insert({
    user_id: opts.userId,
    note_id: opts.noteId ?? null,
    integration_id: integration.id ?? null,
    channel,
    status,
    payload_preview: payloadPreview.slice(0, 2000),
    response_summary: responseSummary,
  });

  return { status, channel, preview: payloadPreview.slice(0, 200) };
}
