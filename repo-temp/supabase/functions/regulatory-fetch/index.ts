const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  const site = Deno.env.get("NEXT_PUBLIC_SITE_URL") ?? "https://medscopeglobal.com";
  const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};

  const res = await fetch(`${site.replace(/\/$/, "")}/api/v5plus/regulatory-fetch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  return new Response(await res.text(), {
    status: res.status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
});
