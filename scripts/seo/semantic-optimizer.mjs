#!/usr/bin/env node
/** v24.2 SEO — semantic optimizer */
export function optimize(meta, section) {
  const routes = { medicine: "/studie", drugs: "/leky", quizzes: "/kvizy" };
  return { ...meta, internalLinks: [routes[section] ?? "/articles"] };
}
