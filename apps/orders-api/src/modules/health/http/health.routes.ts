import { HealthCheckResponseSchema, problemResponseDtoSchema } from '@orderhub/contracts';
import { problem } from '#src/shared/http/problem.js';
import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod';

export type healthCheckDeps = {
  rediness: () => Promise<void>;
};

export const healthRoutesPlugin: FastifyPluginCallbackZod<healthCheckDeps> = function (
  app,
  opts,
  done,
) {
  app.get('/live', { schema: { response: { '2xx': HealthCheckResponseSchema } } }, function () {
    return { status: 'ok' };
  });

  app.get(
    '/ready',
    { schema: { response: { '2xx': HealthCheckResponseSchema, 503: problemResponseDtoSchema } } },
    async function (_req, reply) {
      try {
        await opts.rediness();
        return { status: 'ok' };
      } catch {
        return problem(reply, 503, 'Service Unavailable');
      }
    },
  );

  done();
};
