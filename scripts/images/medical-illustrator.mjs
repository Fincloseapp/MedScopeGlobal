#!/usr/bin/env node
/** v24.6 Image AI — illustration meta */
export function illustrationMeta(title, section) {
  return { alt: `Odborná ilustrace: ${title}`, section, style: "clinical-schematic", safeForPublic: true };
}
