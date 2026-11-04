import Fastify from 'fastify';
import { type Config } from './config.js';
import { randomUUID } from 'node:crypto';
import { validatorCompiler, serializerCompiler } from 'fastify-type-provider-zod';
import { healthRoutes } from './modules/health/health.routes.js';

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

export async function buildApp({ config }: { config: Config }) {
  const app = Fastify({
    logger: getLogger(config),
    genReqId: (req) => (req.headers['x-request-id'] as string | undefined) ?? randomUUID(),
  });

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  app.register(healthRoutes, { prefix: '/health' });

  return app;
}
