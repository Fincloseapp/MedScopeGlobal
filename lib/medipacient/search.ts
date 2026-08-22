/** Filter patient reports on the home list (filename, specialty, plain-language translation). */

export type SearchablePacientDoc = {
  name: string;
  patientSummary?: {
    obor_lekare?: string | null;
    srozumitelny_preklad?: string | null;
  } | null;
};

export function foldCs(value: string): string {
  return (value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function filterPacientReports<T extends SearchablePacientDoc>(docs: T[], query: string): T[] {
  const q = foldCs(query).trim();
  if (!q) return docs;
  return docs.filter((doc) => {
    const hay = foldCs(
      [doc.name, doc.patientSummary?.obor_lekare || "", doc.patientSummary?.srozumitelny_preklad || ""].join("\n"),
    );
    return hay.includes(q);
  });
}
