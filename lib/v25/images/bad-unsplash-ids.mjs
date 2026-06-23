/**
 * v27.3 — known problematic Unsplash photo IDs (dark hands, US hospital, non-European stock).
 * Curated allowlist in photo-engine.mjs is separate; these are explicitly blocked.
 */
export const BAD_UNSPLASH_IDS = [
  "photo-1576091160550-2173dba999ef", // dark-skinned hands clinical
  "photo-1582750433449-648ed127bb54", // US hospital corridor
  "photo-1519494026892-80bbd2d6fd0d", // non-European patient portrait
  "photo-1559839734-2b71ea197ec2", // identifiable patient face
  "photo-1538108149393-fbbd81895907", // US emergency room signage
  "photo-1584513570327-1f25d0c7d098", // dark hands medical
  "photo-1612349317150-e413f6a5b16d", // US clinic branding
  "photo-1505751172879-fb9847c0e0c0", // non-European hands
  "photo-1581594693702-fbdc00b0a2d6", // dark hands gloves
  "photo-1631217868264-e5b1ff5d8800", // US hospital exterior
  "photo-1581595214485-989ff4a4c44d", // dark-skinned hands close-up
  "photo-1579684385127-1ef15d508118", // US medical setting
];

export function hasBadUnsplashId(url) {
  if (!url) return false;
  const u = String(url);
  return BAD_UNSPLASH_IDS.some((id) => u.includes(id));
}
