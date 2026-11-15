import path from "node:path";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@/generated/prisma/client";

function resolveDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL não está definida.");
  }

  // Garante caminho absoluto para SQLite quando o processo muda de cwd.
  if (url.startsWith("file:")) {
    const filePath = url.slice("file:".length);
    if (!path.isAbsolute(filePath)) {
      return `file:${path.join(/*turbopackIgnore: true*/ process.cwd(), filePath)}`;
    }
  }

  return url;
}

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaBetterSqlite3({ url: resolveDatabaseUrl() }),
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
