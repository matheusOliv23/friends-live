import "dotenv/config";
import { defineConfig } from "prisma/config";

/**
 * Migrate/CLI: preferir conexão direta (Neon unpooled).
 * Runtime da app usa DATABASE_URL (pode ser pooled).
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DIRECT_URL"] ?? process.env["DATABASE_URL"],
  },
});
