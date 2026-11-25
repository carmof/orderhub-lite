import type { Prisma, PrismaClient } from '#src/generated/prisma/client.js';
import type { UnitOfWork } from '../uow/unit-of-work.js';

export function prismaUnitOfWork<R>(
  prisma: PrismaClient,
  // receives the transactions and initialize repositories with it (returning them as R)
  bind: (tx: Prisma.TransactionClient) => R,
  options: {
    timeout?: number;
    maxWait?: number;
  } = {},
): UnitOfWork<R> {
  // work - the use case that depends on the Repos initialized with Transaction (Tx)
  return { run: (work) => prisma.$transaction((tx) => work(bind(tx)), options) };
}
