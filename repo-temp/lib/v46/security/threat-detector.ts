import { memoryRateLimit } from "@/lib/v30/security/rate-limit";

const THREAT_QUERY_PATTERNS = [
  /(\%27)|(\')|(\-\-)|(\%23)|(#)/i,
  /((\%3D)|(=))[^\n]*((\%27)|(\')|(\-\-)|(\%3B)|(;))/i,
  /\bunion\b.+\bselect\b/i,
  /<script[\s>]/i,
];

const THREAT_PATH_PATTERNS = [/\.\.\//, /\/etc\/passwd/i];

const bannedIps = new Map<string, { until: number; strikes: number }>();

export type ThreatScan = {
  blocked: boolean;
  reason?: string;
  pattern?: string;
  ip_banned?: boolean;
};

export function scanForThreats(pathname: string, search = ""): ThreatScan {
  for (const pattern of THREAT_PATH_PATTERNS) {
    if (pattern.test(pathname)) {
      return { blocked: true, reason: "suspicious_pattern", pattern: pattern.source };
    }
  }
  if (search) {
    for (const pattern of THREAT_QUERY_PATTERNS) {
      if (pattern.test(search)) {
        return { blocked: true, reason: "suspicious_pattern", pattern: pattern.source };
      }
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

/** Escalating IP ban: 8 strikes in 10 min → 5 min ban */
export function recordThreatStrike(ip: string): { banned: boolean; strikes: number } {
  const rl = memoryRateLimit(`v46:threat:${ip}`, 8, 600_000);
  if (!rl.ok) {
    bannedIps.set(ip, { until: Date.now() + 300_000, strikes: 8 });
    return { banned: true, strikes: 8 };
  }
  return { banned: false, strikes: 8 - rl.remaining };
}

export function getThreatDetectorStatus() {
  return {
    patterns: THREAT_QUERY_PATTERNS.length + THREAT_PATH_PATTERNS.length,
    active_bans: bannedIps.size,
    escalation: "8 strikes / 10min → 5min ban",
  };
}
