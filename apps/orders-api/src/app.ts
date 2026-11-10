import Fastify from 'fastify';
import { type Config } from './config.js';
import { randomUUID } from 'node:crypto';
import { validatorCompiler, serializerCompiler } from 'fastify-type-provider-zod';
import type { ServiceModule } from './shared/module.js';
import { registerErrorHandlerPlugin } from './shared/http/error-handler.js';
import { problem } from './shared/http/problem.js';

const getLogger = (config: Config) => {
  return {
    level: config.LOG_LEVEL,
    redact: ['req.headers.authorization', 'req.headers.cookie'],
    ...(config.NODE_ENV === 'development' ?
      {
        transport: {
          target: 'pino-pretty',
          // options: {
          //   translateTime: 'HH:MM:ss Z',
          //   ignore: 'pid,hostname',
          // },
        },
      }
    : {}),
  };
};
export type AppDeps = { config: Config; modules: ServiceModule[] };

export async function buildApp(deps: AppDeps) {
  const app = Fastify({
    logger: getLogger(deps.config),
    genReqId: (req) => (req.headers['x-request-id'] as string | undefined) ?? randomUUID(),
  });

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  for (const m of deps.modules) {
    if (m.httpPlugin) {
      await app.register(m.httpPlugin);
    }
  }

  app.register(registerErrorHandlerPlugin);
  app.setNotFoundHandler(function (_request, reply) {
    problem(reply, 404, 'Resource not found');
  });

  return app;
}
