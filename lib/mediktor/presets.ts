export const INTEGRATION_PRESETS = [
  { id: "generic", label: "Obecný export / API" },
  { id: "ambulance_pc", label: "Ambulantní PC software" },
  { id: "nis", label: "Nemocniční informační systém (NIS)" },
  { id: "hl7_feed", label: "HL7 (s IT zařízení)" },
  { id: "fhir_r4", label: "FHIR R4 (s IT zařízení)" },
] as const;