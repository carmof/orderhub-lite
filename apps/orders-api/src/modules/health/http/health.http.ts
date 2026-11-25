import type { FastifyPluginAsync } from 'fastify';
import { healthRoutesPlugin, type healthCheckDeps } from './health.routes.js';

export const setHealthHttpPlugins = (deps: healthCheckDeps): FastifyPluginAsync => {
  return async (app) => {
    await app.register(healthRoutesPlugin, deps);
  };
};
