#!/usr/bin/env node
/** v24.2 SEO — meta generator */
export function generateMeta(title, summary) {
  return {
    title: `${title.slice(0, 55)} | MedScopeGlobal`,
    description: summary.slice(0, 155),
  };
}
