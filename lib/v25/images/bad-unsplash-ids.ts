/**
 * v27.3 — known problematic Unsplash photo IDs (dark hands, US hospital, non-European stock).
 */
export const BAD_UNSPLASH_IDS = [
  "photo-1576091160550-2173dba999ef",
  "photo-1582750433449-648ed127bb54",
  "photo-1519494026892-80bbd2d6fd0d",
  "photo-1559839734-2b71ea197ec2",
  "photo-1538108149393-fbbd81895907",
  "photo-1584513570327-1f25d0c7d098",
  "photo-1612349317150-e413f6a5b16d",
  "photo-1505751172879-fb9847c0e0c0",
  "photo-1505751172876-fa1923c5c528",
  "photo-1505751172876-fbf96182a2d8",
  "photo-1581594693702-fbdc00b0a2d6",
  "photo-1631217868264-e5b1ff5d8800",
  "photo-1581595214485-989ff4a4c44d",
  "photo-1579684385127-1ef15d508118",
] as const;

export function hasBadUnsplashId(url?: string | null): boolean {
  if (!url) return false;
  const u = String(url);
  return BAD_UNSPLASH_IDS.some((id) => u.includes(id));
}
