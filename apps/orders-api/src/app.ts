import Fastify from 'fastify';
import { type Config } from './config.js';
import { randomUUID } from 'node:crypto';
import { validatorCompiler, serializerCompiler } from 'fastify-type-provider-zod';
import type { ServiceModule } from './shared/module.js';

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

  return app;
}
