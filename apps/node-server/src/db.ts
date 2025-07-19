// In apps/node-server/src/db.ts
import { PrismaClient } from "@prisma/client";
import { env } from "./env";

// Create a single instance of the Prisma client
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const db = globalForPrisma.prisma || new PrismaClient({
  log: env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
});

if (env.NODE_ENV !== "production") globalForPrisma.prisma = db;