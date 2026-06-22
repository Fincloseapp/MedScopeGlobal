import { persistentRateLimit } from "@/lib/security/rate-limit";

/** Token bucket — v19 article generation: 10 req / 15 min per IP */
export async function checkV19GenerateRateLimit(ip: string) {
  return persistentRateLimit(`v19:gen:${ip}`, 10, 15 * 60_000);
}

/** v20.1 list: 200 req / min per IP (server + client cache) */
export async function checkV19ListRateLimit(ip: string) {
  return persistentRateLimit(`v19:list:${ip}`, 200, 60_000);
}
