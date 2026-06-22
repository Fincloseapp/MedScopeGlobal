import { ImageResponse } from "next/og";
import { getArticleBySlug } from "@/lib/queries/articles";

export const alt = "MedScopeGlobal article";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
          background: "linear-gradient(135deg, #f0f7ff 0%, #ffffff 55%, #e8f2ff 100%)",
          color: "#0b3c5d",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ fontSize: 28, fontWeight: 700, color: "#0d6efd" }}>
          MedScopeGlobal
        </div>
        <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
          <div style={{ fontSize: 56, fontWeight: 700, lineHeight: 1.1 }}>
            {article?.title ?? "Clinical intelligence"}
          </div>
        </div>
        <div style={{ fontSize: 22, color: "#475569" }}>
          {article?.excerpt?.slice(0, 160) ??
            "Evidence-based reporting on digital medicine and global care delivery."}
        </div>
      </div>
    ),
    { ...size }
  );
}
