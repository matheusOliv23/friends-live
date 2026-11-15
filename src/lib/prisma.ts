import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

function resolveDatabaseUrl(): string {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    throw new Error(
      "DATABASE_URL não está definida. Configure a variável de ambiente (Neon/Postgres) no servidor.",
    );
  }

  if (url.startsWith("file:")) {
    throw new Error(
      "DATABASE_URL aponta para SQLite (file:). Use uma URL PostgreSQL da Neon.",
    );
  }

  return url;
}

function createPrismaClient(): PrismaClient {
  const adapter = new PrismaPg({
    connectionString: resolveDatabaseUrl(),
    max: 5,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 5_000,
  });

  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
};

/**
 * Client lazy: evita quebrar o `next build` ao só importar rotas de API
 * antes das env vars estarem disponíveis.
 */
export const prisma: PrismaClient =
  globalForPrisma.prisma ??
  new Proxy({} as PrismaClient, {
    get(_target, property, receiver) {
      const client = (globalForPrisma.prisma ??= createPrismaClient());
      const value = Reflect.get(client, property, receiver);
      return typeof value === "function" ? value.bind(client) : value;
    },
  });
