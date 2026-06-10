#!/usr/bin/env node
/** v24.2 SEO — schema.org */
export function medicalSchema(title, description) {
  return {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    name: title,
    description,
    publisher: { "@type": "Organization", name: "MedScopeGlobal" },
  };
}
