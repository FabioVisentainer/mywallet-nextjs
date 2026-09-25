import {PrismaBetterSqlite3} from "@prisma/adapter-better-sqlite3";
import {PrismaClient} from "@/generated/prisma/client";

declare global {
  var __prisma: PrismaClient | undefined;
}

/**
 * SINGLETON — exemplo 1 de 2.
 *
 * Garante uma única instância do PrismaClient em toda a aplicação.
 *
 * Por quê: cada PrismaClient abre seu próprio pool de conexões com o banco.
 * Em desenvolvimento o Next.js recarrega os módulos a cada mudança de código
 * (hot reload), o que recriaria o cliente e o pool de conexões a cada
 * salvamento, se não houvesse uma instância única guardada fora do ciclo de
 * módulos. `globalThis` sobrevive ao hot reload; em produção o próprio
 * carregamento único do módulo já garante a instância única.
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
