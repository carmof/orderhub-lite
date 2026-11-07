import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod';
import { HelthCheckResponseSchema } from '@orderhub/contracts';

export const healthRoutesPlugin: FastifyPluginCallbackZod = function (app, _opts, done) {
  app.get('/live', { schema: { response: { '2xx': HelthCheckResponseSchema } } }, function () {
    return { status: 'ok' };
  });

  app.get('/ready', { schema: { response: { '2xx': HelthCheckResponseSchema } } }, function () {
    return { status: 'ok' };
  });

  done();
};
