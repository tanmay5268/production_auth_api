import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../../generated/prisma";
import { env } from "../configurations";
const globalForPrisma = globalThis as {
  prisma?: PrismaClient;
};

const connectionString = env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const adapter = new PrismaPg({ connectionString });

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
      adapter,
      log:[]
  });

if (env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}