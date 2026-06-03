// Supabase Edge Function — rate limit check (10/min IP, 100/hr user)
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-user-id",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const { ip, userId } = await req.json();
    if (!ip) {
      return new Response(JSON.stringify({ error: "ip required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: ipResult } = await supabase.rpc("check_rate_limit", {
      p_key: `edge:ip:${ip}`,
      p_limit: 10,
      p_window_ms: 60000,
    });

    if (ipResult && !ipResult.ok) {
      await supabase.from("security_logs").insert({
        ip,
        user_id: userId ?? null,
        action: "edge_rate_limit:ip",
        status: "blocked",
        details: ipResult,
      });
      return new Response(JSON.stringify({ ok: false, reason: "ip_limit" }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (userId) {
      const { data: userResult } = await supabase.rpc("check_rate_limit", {
        p_key: `edge:user:${userId}`,
        p_limit: 100,
        p_window_ms: 3600000,
      });

      if (userResult && !userResult.ok) {
        await supabase.from("security_logs").insert({
          ip,
          user_id: userId,
          action: "edge_rate_limit:user",
          status: "blocked",
          details: userResult,
        });
        return new Response(JSON.stringify({ ok: false, reason: "user_limit" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
