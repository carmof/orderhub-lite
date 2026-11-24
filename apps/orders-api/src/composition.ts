import type { AppDeps } from './app.js';
import type { Config } from './config.js';
import { createOrdersModule } from './modules/orders/index.js';
import { createPrisma } from './shared/db/prisma.js';
import type { Infra } from './shared/infra.js';
import type { ServiceModule } from './shared/module.js';

function buildInfra(config: Config): Infra {
  const prismaDb = createPrisma(config.DATABASE_URL);

  return {
    prismaDb,
    readiness: async () => {
      await prismaDb.$queryRaw`SELECT 1`;
    },
    dispose: () => prismaDb.$disconnect(),
  };
}

export function buildDeps(config: Config): AppDeps {
  const infra = buildInfra(config);
  const orders = createOrdersModule({ infra });
  const modules: ServiceModule[] = [orders];

  return {
    config,
    modules,
    dispose: async () => {
      for (const m of [...modules].reverse()) await m.close?.();
      await infra.dispose();
    },
    readiness: async () => {
      await infra.readiness();
    },
  };
}
