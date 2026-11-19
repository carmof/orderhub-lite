import { HelthCheckResponseSchema } from '@orderhub/contracts';
import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod';

export const healthRoutesPlugin: FastifyPluginCallbackZod = function (app, _opts, done) {
  app.get('/live', { schema: { response: { '2xx': HelthCheckResponseSchema } } }, function () {
    return { status: 'ok' };
  });

  app.get('/ready', { schema: { response: { '2xx': HelthCheckResponseSchema } } }, function () {
    return { status: 'ok' };
  });

  done();
};
