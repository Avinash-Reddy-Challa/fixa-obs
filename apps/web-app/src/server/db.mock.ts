// In apps/web-app/src/server/db.ts or similar file
import { PrismaClient } from "@prisma/client";
import { env } from "../env";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const db = globalForPrisma.prisma || new PrismaClient({
    log: env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
});

if (env.NODE_ENV !== "production") globalForPrisma.prisma = db;