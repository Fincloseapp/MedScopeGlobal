/** Client helpers: export MeDiktor notes as Word-compatible .doc */

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function noteToHtmlBody(note: string): string {
  const blocks = note
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean);

  if (blocks.length === 0) {
    return "<p>&nbsp;</p>";
  }

  return blocks
    .map((block) => {
      const lines = block.split("\n").map((l) => l.trim());
      const first = lines[0] || "";
      // Treat short ALL-CAPS / Title-like first lines as section headings
      const looksLikeHeading =
        lines.length >= 1 &&
        first.length > 0 &&
        first.length <= 80 &&
        !/[.!?]$/.test(first) &&
        (/^[A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ0-9][A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ0-9 /–\-()]{2,}$/.test(first) ||
          /^(Identifikace|Anamnéza|Nynější|Osobní|Rodinná|Farmakologická|Alergická|Sociální|Abúzus|Objektivní|Diagnóza|Doporučení|Kontrola|Terapie|Subjective|Objective|Assessment|Plan|Důvod|Průběh|Provedená|Medikace|Žádost|Nález|Závěr|Subjektivní|Další)/i.test(
            first
          ));

      if (looksLikeHeading && lines.length === 1) {
        return `<h2>${escapeHtml(first)}</h2>`;
      }
      if (looksLikeHeading && lines.length > 1) {
        const rest = lines.slice(1).map(escapeHtml).join("<br>\n");
        return `<h2>${escapeHtml(first)}</h2>\n<p>${rest}</p>`;
      }
      return `<p>${lines.map(escapeHtml).join("<br>\n")}</p>`;
    })
    .join("\n");
}

/** Build a Word-openable .doc (HTML Word format, UTF-8 BOM). */
export function buildMediktorDocBlob(note: string, title = "MeDiktor zápis"): Blob {
  const safeTitle = escapeHtml(title);
  const body = noteToHtmlBody(note);
  const html = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:w="urn:schemas-microsoft-com:office:word"
 xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8">
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<title>${safeTitle}</title>
<!--[if gte mso 9]><xml>
 <w:WordDocument>
  <w:View>Print</w:View>
  <w:Zoom>100</w:Zoom>
  <w:DoNotOptimizeForBrowser/>
 </w:WordDocument>
</xml><![endif]-->
<style>
 <!--
  body { font-family: "Times New Roman", Times, serif; font-size: 12pt; line-height: 1.35; color: #000; }
  h1 { font-size: 14pt; font-weight: bold; margin: 0 0 12pt 0; }
  h2 { font-size: 12pt; font-weight: bold; margin: 14pt 0 6pt 0; }
  p { margin: 0 0 8pt 0; }
 -->
</style>
</head>
<body>
<h1>${safeTitle}</h1>
${body}
</body>
</html>`;

  return new Blob(["\ufeff", html], {
    type: "application/msword",
  });
}

export function mediktorDocFilename(templateId?: string | null): string {
  const stamp = new Date().toISOString().slice(0, 10);
  const tpl = (templateId || "zapis").replace(/[^\w.-]+/g, "_");
  return `MeDiktor-${tpl}-${stamp}.doc`;
}

export function downloadMediktorDoc(
  note: string,
  opts?: { title?: string; templateId?: string | null }
): void {
  if (!note.trim()) return;
  const title = opts?.title || "MeDiktor · klinický zápis";
  const blob = buildMediktorDocBlob(note, title);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = mediktorDocFilename(opts?.templateId);
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}

/** Share as .doc when the device supports file share; otherwise share text. */
export async function shareMediktorDoc(
  note: string,
  opts?: { title?: string; templateId?: string | null }
): Promise<"file" | "text" | "copied"> {
  if (!note.trim()) return "text";
  const title = opts?.title || "MeDiktor zápis";
  const filename = mediktorDocFilename(opts?.templateId);
  const blob = buildMediktorDocBlob(note, title);
  const file = new File([blob], filename, {
    type: "application/msword",
  });

  try {
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      await navigator.share({
        title,
        files: [file],
      });
      return "file";
    }
    if (navigator.share) {
      await navigator.share({ title, text: note });
      return "text";
    }
  } catch (err) {
    // AbortError = user cancelled
    if (err && typeof err === "object" && "name" in err && err.name === "AbortError") {
      throw err;
    }
  }

  await navigator.clipboard.writeText(note);
  return "copied";
}
