import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@/generated/prisma/client";

declare global {
  var __prisma: PrismaClient | undefined;
}

/**
 * SINGLETON (exemplo 1 de 2)
 *
 * Garante que exista um único PrismaClient em toda a aplicação.
 *
 * Por que existe: cada PrismaClient abre suas próprias conexões com o banco.
 * Em desenvolvimento, o Next.js recarrega o código a cada arquivo salvo (hot
 * reload), e sem esse cuidado um cliente novo seria criado a cada save. Por
 * isso o cliente também fica guardado no globalThis, que não é apagado no hot
 * reload. Em produção o arquivo carrega uma vez só, então a própria classe já
 * garante a instância única.
 */
class PrismaSingleton {
  private static instance: PrismaClient | undefined;

  private constructor() {}

  static getInstance(): PrismaClient {
    if (!PrismaSingleton.instance) {
      const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL || "file:./dev.db" });
      PrismaSingleton.instance = new PrismaClient({ adapter });
    }
    return PrismaSingleton.instance;
  }
}

export const prisma = globalThis.__prisma ?? PrismaSingleton.getInstance();

if (process.env.NODE_ENV !== "production") globalThis.__prisma = prisma;
