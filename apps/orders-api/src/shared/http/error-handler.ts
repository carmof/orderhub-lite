import { type FastifyPluginAsync } from 'fastify';
import { FastifyError } from '@fastify/error';
import { hasZodFastifySchemaValidationErrors } from 'fastify-type-provider-zod';
import { ConflictError, NotFoundError } from '../errors.js';

export const registerErrorHandlerPlugin: FastifyPluginAsync = async (app) => {
  app.setErrorHandler(function (error, request, reply) {
    if (hasZodFastifySchemaValidationErrors(error)) {
      return reply.status(400).send({
        errors: error.validation,
      });
    }

    if (error instanceof NotFoundError) {
      return reply.status(404).send(error.message);
    }

    if (error instanceof ConflictError) {
      return reply.status(409).send(error.message);
    }

    if (error instanceof FastifyError) {
      if (error.statusCode && error.statusCode < 500) {
        throw error;
      }
    }

    request.log.error({ error });
    return reply.status(500);
  });

  await Promise.resolve();
};
