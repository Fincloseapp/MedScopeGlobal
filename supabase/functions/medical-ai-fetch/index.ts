/**
 * Supabase Edge Function — V4d daily medical AI fetch.
 * Invoke via Supabase cron or POST with service role / CRON_SECRET header.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-cron-secret",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const cronSecret = Deno.env.get("CRON_SECRET");
  const headerSecret = req.headers.get("x-cron-secret");
  const auth = req.headers.get("authorization");
  if (
    cronSecret &&
    headerSecret !== cronSecret &&
    auth !== `Bearer ${cronSecret}`
  ) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const siteUrl =
    Deno.env.get("NEXT_PUBLIC_SITE_URL") ?? "https://medscopeglobal.com";
  const target = `${siteUrl.replace(/\/$/, "")}/api/cron/medical-ai-fetch`;

  try {
    const res = await fetch(target, {
      headers: cronSecret ? { Authorization: `Bearer ${cronSecret}` } : {},
    });
    const body = await res.text();
    return new Response(body, {
      status: res.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);
    const runId = crypto.randomUUID();
    await supabase.from("medical_ai_logs").insert({
      run_id: runId,
      log_type: "error",
      message: "Edge proxy failed — configure NEXT_PUBLIC_SITE_URL + CRON_SECRET",
      details: { error: String(err) },
    });
    return new Response(JSON.stringify({ ok: false, error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
