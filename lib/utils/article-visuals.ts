const coverPalettes = [
  {
    from: "#021B2E",
    via: "#0A3D5C",
    to: "#0B79B0",
    glow: "rgba(70, 181, 255, 0.28)",
  },
  {
    from: "#041A2F",
    via: "#0F5A9D",
    to: "#0F91D6",
    glow: "rgba(38, 173, 230, 0.27)",
  },
  {
    from: "#071B2B",
    via: "#0B4468",
    to: "#1C8CB3",
    glow: "rgba(25, 255, 203, 0.2)",
  },
  {
    from: "#041221",
    via: "#0C365B",
    to: "#1A66A1",
    glow: "rgba(157, 224, 255, 0.24)",
  },
] as const;

function hashString(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getArticleCoverStyles(
  title: string,
  categoryName?: string | null
) {
  const seed = `${categoryName ?? "medical"}:${title}`;
  const index = hashString(seed) % coverPalettes.length;
  const palette = coverPalettes[index];

  return {
    background: `radial-gradient(circle at top left, ${palette.glow}, rgba(3, 10, 20, 0.35) 30%), linear-gradient(160deg, ${palette.from}, ${palette.via} 45%, ${palette.to})`,
    boxShadow: `inset 0 1px 0 rgba(255,255,255,0.15), 0 24px 60px -30px ${palette.glow}`,
  } as const;
}

export function getArticleCoverLabel(
  articleTitle: string,
  categoryName?: string | null
) {
  const label = categoryName?.trim() || "Medical briefing";
  const shortTitle = articleTitle.trim().split(" ").slice(0, 4).join(" ");
  return {
    label,
    shortTitle: shortTitle || "Clinical insight",
  };
}
