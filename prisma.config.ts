import { defineConfig } from "prisma/config";

function resolveMigrationUrl() {
  const candidates = [
    process.env.POSTGRES_URL_NON_POOLING,
    process.env.DIRECT_URL,
    process.env.POSTGRES_PRISMA_URL,
    process.env.POSTGRES_URL,
    process.env.DATABASE_URL
  ];

  for (const value of candidates) {
    if (value && !/\[(PASSWORD|REF|HESLO)\]/i.test(value)) return value;
  }

  return "postgresql://user:password@localhost:5432/medscopeglobal";
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "node prisma/seed.mjs"
  },
  datasource: {
    url: resolveMigrationUrl()
  }
});
