import type { Prisma, PrismaClient } from '#src/generated/prisma/client.js';
import type { UnitOfWork } from '../uow/unit-of-work.js';

export function prismaUnitOfWork<R>(
  prisma: PrismaClient,
  bind: (tx: Prisma.TransactionClient) => R,
  options: {
    timeout?: number;
    maxWait?: number;
  } = {},
): UnitOfWork<R> {
  return { run: (work) => prisma.$transaction((tx) => work(bind(tx)), options) };
}
