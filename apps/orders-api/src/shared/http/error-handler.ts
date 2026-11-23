import { type FastifyInstance } from 'fastify';
import { hasZodFastifySchemaValidationErrors } from 'fastify-type-provider-zod';
import { ConflictError, NotFoundError } from '../errors.js';
import { problem } from './problem.js';

export const registerErrorHandler = (app: FastifyInstance): void => {
  app.setErrorHandler(function (error, request, reply) {
    if (hasZodFastifySchemaValidationErrors(error)) {
      return problem(
        reply,
        400,
        'Bad Request',
        'Some field of the request is not correct or missing',
        { details: error.validation },
      );
    }

    if (error instanceof NotFoundError) {
      return problem(reply, 404, 'Not Found Error', error.message);
    }

    if (error instanceof ConflictError) {
      return problem(reply, 409, 'Conflict Error', error.message);
    }

    const sc = (error as { statusCode?: number }).statusCode;
    if (error instanceof Error && sc && sc < 500) {
      return problem(reply, sc, 'Error', error.message);
    }

    request.log.error({ err: error }, 'not treated error');
    return problem(reply, 500, 'Internal Server Error');
  });

  app.setNotFoundHandler(function (_request, reply) {
    return problem(reply, 404, 'Resource not found');
  });
};
