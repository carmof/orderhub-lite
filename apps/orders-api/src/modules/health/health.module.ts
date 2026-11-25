import type { ServiceModule } from '#src/shared/module.js';
import { setHealthHttpPlugins } from './http/health.http.js';
import type { healthCheckDeps } from './http/health.routes.js';

export const createHealthCheckModule = (deps: healthCheckDeps): ServiceModule => {
  return {
    name: 'healthCheck',
    httpPlugin: setHealthHttpPlugins(deps),
    api: () => {},
  };
};
