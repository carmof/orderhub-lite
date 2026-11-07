import type { AppDeps } from './app.js';
import type { Config } from './config.js';
import { createOrdersModule } from './modules/orders/orders.module.js';
import type { ServiceModule } from './shared/module.js';

export function buildDeps(config: Config): AppDeps {
  const orders = createOrdersModule();
  const modules: ServiceModule[] = [orders];

  return { config, modules };
}
