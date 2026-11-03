import Fastify from 'fastify';
import { type Config } from './config.js';
import { randomUUID } from 'node:crypto';

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
  const fastify = Fastify({
    logger: getLogger(config),
    genReqId: (req) => (req.headers['x-request-id'] as string | undefined) ?? randomUUID(),
  });

  fastify.get('/health/live', function () {
    return { status: 'ok' };
  });

  fastify.get('/health/ready', function () {
    return { status: 'ok' };
  });

  return fastify;
}
