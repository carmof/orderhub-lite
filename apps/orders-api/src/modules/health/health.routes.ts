import type { FastifyPluginCallbackZod, ZodTypeProvider } from 'fastify-type-provider-zod';
import { HelthCheckResponseSchema, type HelthCheckResponse } from '@orderhub/contracts';

export const healthRoutes: FastifyPluginCallbackZod = (app, _, done) => {
  app.withTypeProvider<ZodTypeProvider>();

  app.get(
    '/live',
    { schema: { response: { '2xx': HelthCheckResponseSchema } } },
    function (): HelthCheckResponse {
      return { status: 'ok' };
    },
  );

  app.get(
    '/ready',
    { schema: { response: { '2xx': HelthCheckResponseSchema } } },
    function (): HelthCheckResponse {
      return { status: 'ok' };
    },
  );
  done();
};
