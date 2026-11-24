import { type PrismaClient } from '#src/generated/prisma/client.js';

export interface Infra {
  prismaDb: PrismaClient;
  readiness: () => Promise<void>;
  dispose: () => Promise<void>;
}
