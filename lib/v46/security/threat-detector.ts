import { memoryRateLimit } from "@/lib/v30/security/rate-limit";

const THREAT_PATTERNS = [
  /(\%27)|(\')|(\-\-)|(\%23)|(#)/i,
  /((\%3D)|(=))[^\n]*((\%27)|(\')|(\-\-)|(\%3B)|(;))/i,
  /\bunion\b.+\bselect\b/i,
  /<script[\s>]/i,
  /\.\.\//,
  /\/etc\/passwd/i,
];

const bannedIps = new Map<string, { until: number; strikes: number }>();

export type ThreatScan = {
  blocked: boolean;
  reason?: string;
  pattern?: string;
  ip_banned?: boolean;
};

export function scanForThreats(input: string): ThreatScan {
  for (const pattern of THREAT_PATTERNS) {
    if (pattern.test(input)) {
      return { blocked: true, reason: "suspicious_pattern", pattern: pattern.source };
    }
  }
  return { blocked: false };
}

export function checkIpBan(ip: string): { banned: boolean; retryAfter?: number } {
  const entry = bannedIps.get(ip);
  if (!entry) return { banned: false };
  if (entry.until <= Date.now()) {
    bannedIps.delete(ip);
    return { banned: false };
  }
  return { banned: true, retryAfter: Math.ceil((entry.until - Date.now()) / 1000) };
}

/** Escalating IP ban: 3 strikes in 5 min → 15 min ban */
export function recordThreatStrike(ip: string): { banned: boolean; strikes: number } {
  const rl = memoryRateLimit(`v46:threat:${ip}`, 3, 300_000);
  if (!rl.ok) {
    bannedIps.set(ip, { until: Date.now() + 900_000, strikes: 3 });
    return { banned: true, strikes: 3 };
  }
  return { banned: false, strikes: 3 - rl.remaining };
}

export function getThreatDetectorStatus() {
  return {
    patterns: THREAT_PATTERNS.length,
    active_bans: bannedIps.size,
    escalation: "3 strikes / 5min → 15min ban",
  };
}
