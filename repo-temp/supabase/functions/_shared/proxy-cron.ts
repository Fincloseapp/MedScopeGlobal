/** Shared edge proxy → Next.js V6 cron API */
export function createCronProxy(cronPath: string) {
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type, x-cron-secret",
  };

  return async (req: Request) => {
    if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

    const site = Deno.env.get("NEXT_PUBLIC_SITE_URL") ?? "https://www.medscopeglobal.com";
    const secret = Deno.env.get("CRON_SECRET");
    const res = await fetch(`${site.replace(/\/$/, "")}${cronPath}`, {
      headers: secret ? { Authorization: `Bearer ${secret}` } : {},
    });
    return new Response(await res.text(), {
      status: res.status,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  };
}
