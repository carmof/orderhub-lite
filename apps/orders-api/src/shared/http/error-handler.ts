import { type FastifyPluginCallback } from 'fastify';
import { FastifyError } from '@fastify/error';
import { hasZodFastifySchemaValidationErrors } from 'fastify-type-provider-zod';
import { ConflictError, NotFoundError } from '../errors.js';
import { problem } from './problem.js';

export const registerErrorHandlerPlugin: FastifyPluginCallback = (app, _opts, done) => {
  app.setErrorHandler(function (error, request, reply) {
    if (hasZodFastifySchemaValidationErrors(error)) {
      problem(reply, 400, 'Schema Validation Error', error.name, { details: error.validation });
      return reply;
    }

    if (error instanceof NotFoundError) {
      problem(reply, 404, error.name, error.message);
      return reply;
    }

    if (error instanceof ConflictError) {
      problem(reply, 409, error.name, error.message);
      return reply;
    }

    if (error instanceof FastifyError) {
      if (error.statusCode && error.statusCode < 500) {
        throw error;
      }
    }

    request.log.error({ error }, 'erro não tratado');
    problem(reply, 500, 'Internal Server Error');
    return reply;
  });

  app.setNotFoundHandler(function (_request, reply) {
    problem(reply, 404, 'Resource not found');
  });

  done();
};
