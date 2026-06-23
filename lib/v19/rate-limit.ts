import { persistentRateLimit } from "@/lib/security/rate-limit";

/** Token bucket — v19 article generation: 10 req / 15 min per IP */
export async function checkV19GenerateRateLimit(ip: string) {
  return persistentRateLimit(`v19:gen:${ip}`, 10, 15 * 60_000);
}

/** v19 list: 60 req / min per IP */
export async function checkV19ListRateLimit(ip: string) {
  return persistentRateLimit(`v19:list:${ip}`, 60, 60_000);
}
