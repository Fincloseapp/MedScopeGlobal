"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[MedScopeGlobal]", error);
  }, [error]);

  return (
    <html lang="cs">
      <body style={{ fontFamily: "system-ui, sans-serif", margin: 0, background: "#e8eef3", color: "#021d33" }}>
        <main style={{ maxWidth: 560, margin: "4rem auto", padding: "0 1rem" }}>
          <p style={{ fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: "#005B96", fontWeight: 700 }}>
            MedScopeGlobal.com
          </p>
          <h1 style={{ fontSize: 28, margin: "0.5rem 0 0.75rem" }}>Stránka se nenačetla</h1>
          <p style={{ color: "#475569", lineHeight: 1.5 }}>
            Došlo k chybě v prohlížeči. Obnovte stránku. Magazín a aplikace MeDipacient, MeDiprep a MeDiktor zůstávají na
            medscopeglobal.com.
          </p>
          <p style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <button
              type="button"
              onClick={() => reset()}
              style={{
                background: "#005B96",
                color: "#fff",
                border: 0,
                borderRadius: 8,
                padding: "10px 16px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Obnovit
            </button>
            <a
              href="/"
              style={{
                border: "1px solid #cbd5e1",
                borderRadius: 8,
                padding: "10px 16px",
                fontWeight: 600,
                color: "#021d33",
                textDecoration: "none",
              }}
            >
              Domů
            </a>
          </p>
        </main>
      </body>
    </html>
  );
}
